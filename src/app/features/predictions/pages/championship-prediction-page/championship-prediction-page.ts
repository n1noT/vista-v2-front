/**
 * `/predictions/league/:id` (guarded — see `predictions.routes.ts`).
 * The domestic-championship half of `Composants_Cles.md`'s
 * `DraggableLeagueTable` spec — Champions League predictions
 * (`/predictions/ldc/*`) are out of scope here, see CLAUDE.md.
 *
 * On navigation, resolves the route's `:id` (a `leagueId`) to a
 * `LeagueDetail` (`GET /predictions/leagues/:leagueId` — team list for the
 * current season) and the player's own `Prediction` for that league/season, if any
 * (`GET /predictions`). `teams` (the working drag-and-drop *ranked* order,
 * passed to `DraggableLeagueTable`'s `ranked` model — the unranked pool is
 * derived inside that component from `detail.teams` minus `teams`) starts
 * from the saved prediction's item positions when one exists, or empty
 * otherwise — an empty prediction is *not* the same as "ranked in real
 * standings order," so there's no fallback to `LeagueDetail`'s default
 * order here. Reactive on `route.paramMap` (not just the initial snapshot)
 * since Angular's default `RouteReuseStrategy` reuses this component across
 * `/predictions/league/1` → `/predictions/league/2` navigations —
 * only params change, the component instance doesn't get recreated.
 *
 * The header also shows `totalPotentialPoints`, a live sum of the
 * per-row potential-points badges `DraggableLeagueTable` renders (shared
 * math in `potential-points.util.ts`) — the ceiling score for the current
 * arrangement, updating as the player drags teams around.
 *
 * `readOnly` (passed to `DraggableLeagueTable`) is `true` once the
 * prediction is `SUBMITTED` or the season's `startDate` has passed — per
 * `Fonctionnalites_Joueurs.md`, unsubmitted predictions auto-submit at that
 * deadline, but that auto-submit job itself isn't built yet (a
 * `@nestjs/schedule` cron, tracked separately); this page only enforces the
 * deadline for its own read/write UI, it doesn't perform the auto-submit.
 * "Submit definitively" is irreversible (per the same doc), hence the
 * `ConfirmModal` guard before calling it — clicking the button only opens
 * the modal (`showSubmitConfirm`), the actual `POST /predictions/submit`
 * fires from `confirmSubmit()` once the player confirms in it.
 *
 * `showRealPosition` is passed to `DraggableLeagueTable` under the same
 * `SUBMITTED`-only condition as `hidePool`, so a locked-in prediction shows
 * each team's true/live standing next to its guessed slot.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { PredictionsService } from '../../predictions.service';
import { LeagueDetail, LeagueTeamStanding } from '../../league-detail.model';
import { CUPredictionsPayload, Prediction } from '../../prediction.model';
import { DraggableLeagueTable } from '../../components/draggable-league-table/draggable-league-table';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';
import { placementPreview } from '../../potential-points.util';

@Component({
  selector: 'app-championship-prediction-page',
  imports: [RouterLink, DatePipe, DraggableLeagueTable, ConfirmModal],
  templateUrl: './championship-prediction-page.html',
})
export class ChampionshipPredictionPage {
  private readonly route = inject(ActivatedRoute);
  private readonly predictionsService = inject(PredictionsService);

  protected readonly leagueDetail = signal<LeagueDetail | null>(null);
  protected readonly prediction = signal<Prediction | null>(null);
  protected readonly teams = signal<LeagueTeamStanding[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitting = signal(false);
  protected readonly statusMessage = signal<string | null>(null);
  protected readonly showSubmitConfirm = signal(false);

  protected readonly readOnly = computed(() => {
    if (this.prediction()?.status === 'SUBMITTED') {
      return true;
    }
    const detail = this.leagueDetail();
    return detail !== null && new Date(detail.seasonStartDate).getTime() <= Date.now();
  });

  /**
   * Only submission requires every team ranked — the API allows saving a
   * partial draft (any subset, as long as its positions are gap-free
   * starting at 1), so `saveDraft` doesn't gate on this.
   */
  protected readonly isComplete = computed(() => {
    const detail = this.leagueDetail();
    return detail !== null && this.teams().length === detail.teams.length;
  });

  /**
   * Sum of every currently-ranked row's potential-points badge (see
   * `potential-points.util.ts`) — the total the player would score if this
   * exact arrangement turns out exactly right. Recomputes live as teams are
   * dragged; teams with no `expectedPosition` set contribute 0, same as
   * showing no badge for them in `DraggableLeagueTable`.
   */
  protected readonly totalPotentialPoints = computed(() => {
    const detail = this.leagueDetail();
    if (!detail) {
      return 0;
    }
    const teamCount = detail.teams.length;
    return this.teams().reduce(
      (sum, team, index) => sum + (placementPreview(team.expectedPosition, index + 1, teamCount)?.points ?? 0),
      0,
    );
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        switchMap((leagueId) => this.predictionsService.getLeagueDetail(leagueId)),
        switchMap((detail) =>
          this.predictionsService
            .getOwnPrediction(detail.leagueId, detail.seasonId)
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
          this.errorMessage.set(
            err.status === 404 ? 'This championship is not open for predictions yet.' : 'Could not load this championship.',
          );
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
    if (!detail || this.readOnly() || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.statusMessage.set(null);
    this.errorMessage.set(null);

    this.predictionsService.saveDraft(this.buildPayload(detail)).subscribe({
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
    if (!detail || this.readOnly() || this.submitting() || !this.isComplete()) {
      return;
    }
    this.showSubmitConfirm.set(true);
  }

  protected confirmSubmit(): void {
    this.showSubmitConfirm.set(false);
    const detail = this.leagueDetail();
    if (!detail) {
      return;
    }

    this.submitting.set(true);
    this.statusMessage.set(null);
    this.errorMessage.set(null);

    this.predictionsService.submit(this.buildPayload(detail)).subscribe({
      next: (prediction) => {
        this.submitting.set(false);
        this.prediction.set(prediction);
        this.statusMessage.set('Prediction submitted definitively.');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not submit prediction.'));
      },
    });
  }

  private extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const message: unknown = err.error?.message;
    return typeof message === 'string' ? message : fallback;
  }
}
