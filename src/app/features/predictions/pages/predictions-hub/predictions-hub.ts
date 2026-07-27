/**
 * `/predictions` hub (guarded — see `predictions.routes.ts`). Per
 * `vista-v2-docs/02_Frontend_UI/Arborescence_Pages.md`, this page's job is
 * just to fan a player out into the per-competition prediction pages: the
 * five domestic leagues (`/predictions/league/[id]`) plus the two
 * Champions League phases (`/predictions/ldc/phase-ligue|phase-finale`).
 *
 * The five leagues are fetched from `PredictionsService.getAvailableLeagues`
 * (`GET /predictions/leagues`, `PredictionsController` on the API), which
 * only returns leagues that currently have `TeamLeagueSeason` rows for the
 * season `FootballSyncService` has marked current — so this list is empty
 * until that daily sync has run at least once. Each entry's
 * `predictionStatus` (`NOT_STARTED`/`DRAFT`/`SUBMITTED`) is rendered as a
 * badge so a player can see at a glance which championships they've already
 * locked in. The Champions League entries aren't backed by anything yet —
 * the schema deliberately doesn't model CL standings yet (see
 * `football-sync/constants.ts`), and their destination routes
 * (`/predictions/ldc/phase-ligue|phase-finale`) aren't registered in
 * `predictions.routes.ts` — so they're rendered as disabled, non-navigating
 * rows with a "Work in progress" badge rather than dead `routerLink`s.
 */
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PredictionsService } from '../../predictions.service';
import { AvailableLeague } from '../../available-league.model';

@Component({
  selector: 'app-predictions-hub',
  imports: [RouterLink],
  templateUrl: './predictions-hub.html',
})
export class PredictionsHub {
  private readonly predictionsService = inject(PredictionsService);

  protected readonly leagues = signal<AvailableLeague[] | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.predictionsService.getAvailableLeagues().subscribe({
      next: (leagues) => this.leagues.set(leagues),
      error: (err: HttpErrorResponse) => {
        this.leagues.set([]);
        this.errorMessage.set(err.status === 0 ? 'Could not reach the server.' : 'Could not load championships.');
      },
    });
  }
}
