/**
 * `/admin/seasons/:id` (guarded by `adminGuard`). The team↔season join half
 * of `Fonctionnalites_Admin.md`'s "Saison" bullets: "L'admin peut
 * ajouter/supprimer une équipe à un championnat d'une saison." Every
 * `Season` belongs to exactly one `League` (`Season.leagueId`, shown in the
 * page header via `SeasonDetail.league`), so adding a team only needs a
 * team picker (`AdminTeamsService`, reused as-is from the teams admin
 * feature) — there's no separate league to pick per participation anymore.
 *
 * The edit row also sets `expectedPosition` ("F" from `Calcul_Cotes.md`,
 * the bookmaker-expected position `AdminResultsService` scores predictions
 * against). It's optional and left blank by default (not every team has
 * odds set yet) — only submitted when non-null, via a second call to
 * `AdminOddsService.updateExpectedPosition` (a distinct API resource from
 * `AdminSeasonsService.updateParticipation`, matching the API's
 * `admin/odds/` vs `admin/seasons/` module split). The two calls run
 * sequentially (not `forkJoin`) so the merged result always reflects both
 * writes rather than a race between them.
 *
 * Removing a participation (and editing its position/played games/odds) is
 * instant, no confirmation — it's reversible (re-add the same team, or
 * re-edit the odds) and only affects standings-prediction seed data, not
 * player predictions themselves (`PredictionItem.teamId` references `Team`
 * directly, not this join row).
 */
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { map, of, switchMap } from 'rxjs';
import { AdminSeasonsService } from '../../admin-seasons.service';
import { AdminTeamsService } from '../../../teams/admin-teams.service';
import { AdminOddsService } from '../../../odds/admin-odds.service';
import { Participation, SeasonDetail } from '../../season.model';
import { Team } from '../../../teams/team.model';

@Component({
  selector: 'app-admin-season-detail-page',
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './admin-season-detail-page.html',
})
export class AdminSeasonDetailPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly adminSeasonsService = inject(AdminSeasonsService);
  private readonly adminTeamsService = inject(AdminTeamsService);
  private readonly adminOddsService = inject(AdminOddsService);

  protected readonly seasonId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly season = signal<SeasonDetail | null>(null);
  protected readonly teams = signal<Team[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly adding = signal(false);
  protected readonly addForm = this.fb.nonNullable.group({
    teamId: [0, [Validators.required, Validators.min(1)]],
    position: [1, [Validators.required, Validators.min(1)]],
    playedGames: [0, [Validators.required, Validators.min(0)]],
  });

  protected readonly editingId = signal<number | null>(null);
  protected readonly savingEdit = signal(false);
  protected readonly editForm = this.fb.group({
    position: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    playedGames: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    // Optional — left null when a team's odds haven't been set yet; only
    // sent to `AdminOddsService` when the admin actually fills it in.
    expectedPosition: this.fb.control<number | null>(null, [Validators.min(1)]),
  });

  protected readonly pendingRemoveId = signal<number | null>(null);

  constructor() {
    this.fetchAll();
  }

  protected addTeam(): void {
    if (this.addForm.invalid || this.adding()) {
      return;
    }
    this.adding.set(true);
    this.errorMessage.set(null);

    this.adminSeasonsService.addTeam(this.seasonId, this.addForm.getRawValue()).subscribe({
      next: (participation) => {
        this.season.update((detail) =>
          detail ? { ...detail, participations: [...detail.participations, participation] } : detail,
        );
        this.adding.set(false);
        this.addForm.patchValue({ position: 1, playedGames: 0 });
      },
      error: (err: HttpErrorResponse) => {
        this.adding.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not add team.'));
      },
    });
  }

  protected startEditing(participation: Participation): void {
    this.errorMessage.set(null);
    this.editingId.set(participation.id);
    this.editForm.setValue({
      position: participation.position,
      playedGames: participation.playedGames,
      expectedPosition: participation.expectedPosition,
    });
  }

  protected cancelEditing(): void {
    this.editingId.set(null);
  }

  protected saveEdit(participation: Participation): void {
    if (this.editForm.invalid || this.savingEdit()) {
      return;
    }
    this.savingEdit.set(true);
    this.errorMessage.set(null);

    const { position, playedGames, expectedPosition } = this.editForm.getRawValue();

    this.adminSeasonsService
      .updateParticipation(this.seasonId, participation.id, { position, playedGames })
      .pipe(
        switchMap((updated) =>
          expectedPosition === null
            ? of(updated)
            : this.adminOddsService
                .updateExpectedPosition(participation.id, expectedPosition)
                .pipe(map((odds) => ({ ...updated, expectedPosition: odds.expectedPosition }))),
        ),
      )
      .subscribe({
        next: (updated) => {
          this.season.update((detail) =>
            detail
              ? { ...detail, participations: detail.participations.map((p) => (p.id === updated.id ? updated : p)) }
              : detail,
          );
          this.savingEdit.set(false);
          this.editingId.set(null);
        },
        error: (err: HttpErrorResponse) => {
          this.savingEdit.set(false);
          this.errorMessage.set(this.extractErrorMessage(err, 'Could not save changes.'));
        },
      });
  }

  protected removeParticipation(participation: Participation): void {
    if (this.pendingRemoveId()) {
      return;
    }
    this.pendingRemoveId.set(participation.id);
    this.errorMessage.set(null);

    this.adminSeasonsService.removeParticipation(this.seasonId, participation.id).subscribe({
      next: () => {
        this.season.update((detail) =>
          detail
            ? { ...detail, participations: detail.participations.filter((p) => p.id !== participation.id) }
            : detail,
        );
        this.pendingRemoveId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.pendingRemoveId.set(null);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not remove team.'));
      },
    });
  }

  private extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const message: unknown = err.error?.message;
    return typeof message === 'string' ? message : fallback;
  }

  private fetchAll(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.adminSeasonsService.get(this.seasonId).subscribe({
      next: (season) => {
        this.season.set(season);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load this season.');
        this.loading.set(false);
      },
    });
    this.adminTeamsService.list().subscribe((teams) => this.teams.set(teams));
  }
}
