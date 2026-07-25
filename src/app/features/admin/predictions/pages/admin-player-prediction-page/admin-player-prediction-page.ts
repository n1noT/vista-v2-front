/**
 * `/admin/users/:userId/predictions/league/:leagueId` (guarded by
 * `adminGuard`). Admin counterpart to `ChampionshipPredictionPage`, reusing
 * the same `DraggableLeagueTable` and league-detail/prediction fetch shape,
 * but for an arbitrary player instead of the logged-in one, and with two
 * deliberate differences from the player-facing page:
 *
 * - There's no `readOnly` state at all. Per `Fonctionnalites_Admin.md`,
 *   admin edits are allowed even once a prediction is `SUBMITTED` — the API
 *   already enforces this via `bypassSubmittedLock` (see
 *   `AdminPredictionsService`/`PredictionsService.save`), so the UI simply
 *   never locks the table.
 * - "Submit" has no confirm-modal guard. The player-facing page treats
 *   submission as irreversible and gates it behind `ConfirmModal`, but from
 *   the admin's seat it isn't irreversible — they can always come back and
 *   re-save either status — so that friction doesn't apply here.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminPredictionsService } from '../../admin-predictions.service';
import { AdminUsersService } from '../../../users/admin-users.service';
import { LeagueDetail, LeagueTeamStanding } from '../../../../predictions/league-detail.model';
import { CUPredictionsPayload, Prediction } from '../../../../predictions/prediction.model';
import { User } from '../../../../../core/auth/user.model';
import { DraggableLeagueTable } from '../../../../predictions/components/draggable-league-table/draggable-league-table';

@Component({
  selector: 'app-admin-player-prediction-page',
  imports: [RouterLink, DraggableLeagueTable],
  templateUrl: './admin-player-prediction-page.html',
})
export class AdminPlayerPredictionPage {
  private readonly route = inject(ActivatedRoute);
  private readonly adminPredictionsService = inject(AdminPredictionsService);
  private readonly adminUsersService = inject(AdminUsersService);

  protected readonly userId = this.route.snapshot.paramMap.get('userId')!;
  protected readonly player = signal<User | null>(null);
  protected readonly leagueDetail = signal<LeagueDetail | null>(null);
  protected readonly prediction = signal<Prediction | null>(null);
  protected readonly teams = signal<LeagueTeamStanding[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitting = signal(false);
  protected readonly statusMessage = signal<string | null>(null);

  protected readonly isComplete = computed(() => {
    const detail = this.leagueDetail();
    return detail !== null && this.teams().length === detail.teams.length;
  });

  constructor() {
    const leagueId = Number(this.route.snapshot.paramMap.get('leagueId'));

    this.adminUsersService
      .get(this.userId)
      .pipe(
        tap((player) => this.player.set(player)),
        switchMap(() => this.adminPredictionsService.getLeagueDetail(leagueId)),
        switchMap((detail) =>
          this.adminPredictionsService
            .getPrediction(this.userId, detail.leagueId, detail.seasonId)
            .pipe(map((prediction) => ({ detail, prediction }))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: ({ detail, prediction }) => {
          this.leagueDetail.set(detail);
          this.prediction.set(prediction);
          this.teams.set(this.orderTeams(detail, prediction));
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(err.status === 404 ? 'Player or championship not found.' : 'Could not load this championship.');
        },
      });
  }

  private orderTeams(detail: LeagueDetail, prediction: Prediction | null): LeagueTeamStanding[] {
    if (!prediction || prediction.items.length === 0) {
      return [];
    }
    const teamById = new Map(detail.teams.map((team) => [team.teamId, team]));
    return [...prediction.items]
      .sort((a, b) => a.position - b.position)
      .map((item) => teamById.get(item.teamId))
      .filter((team): team is LeagueTeamStanding => team !== undefined);
  }

  private buildPayload(detail: LeagueDetail): CUPredictionsPayload {
    return {
      leagueId: detail.leagueId,
      seasonId: detail.seasonId,
      predictions: this.teams().map((team, index) => ({ teamId: team.teamId, position: index + 1 })),
    };
  }

  protected saveDraft(): void {
    const detail = this.leagueDetail();
    if (!detail || this.saving() || this.submitting()) {
      return;
    }
    this.saving.set(true);
    this.statusMessage.set(null);
    this.errorMessage.set(null);

    this.adminPredictionsService.saveDraft(this.userId, this.buildPayload(detail)).subscribe({
      next: (prediction) => {
        this.saving.set(false);
        this.prediction.set(prediction);
        this.statusMessage.set('Draft saved.');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not save draft.'));
      },
    });
  }

  protected submitDefinitively(): void {
    const detail = this.leagueDetail();
    if (!detail || this.saving() || this.submitting() || !this.isComplete()) {
      return;
    }
    this.submitting.set(true);
    this.statusMessage.set(null);
    this.errorMessage.set(null);

    this.adminPredictionsService.submit(this.userId, this.buildPayload(detail)).subscribe({
      next: (prediction) => {
        this.submitting.set(false);
        this.prediction.set(prediction);
        this.statusMessage.set('Prediction saved as submitted.');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not save prediction.'));
      },
    });
  }

  private extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const message: unknown = err.error?.message;
    return typeof message === 'string' ? message : fallback;
  }
}
