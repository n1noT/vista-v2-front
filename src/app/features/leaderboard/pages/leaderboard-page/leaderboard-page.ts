/**
 * `/leaderboard` (guarded — see `leaderboard.routes.ts`). Per
 * `Fonctionnalites_Joueurs.md` ("Leaderboard"): a player can see their
 * position in the general ranking (cumulative points across every
 * competition) and can switch to a per-competition ranking. The "General"
 * tab calls `GET /leaderboard` with no `leagueId`; each league tab re-calls
 * it with that league's id. League tabs are fetched from
 * `PredictionsService.getAvailableLeagues` (the same list the predictions
 * hub uses) rather than duplicated here — Champions League has no tab yet
 * since it isn't modeled in the schema (see `predictions-hub.ts`).
 *
 * The signed-in player's own row is highlighted by matching `userId` against
 * `AuthService.currentUser()`, so they can find themselves in a long list
 * without scrolling/searching.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';
import { LeaderboardService } from '../../leaderboard.service';
import { LeaderboardEntry } from '../../leaderboard.model';
import { PredictionsService } from '../../../predictions/predictions.service';
import { AvailableLeague } from '../../../predictions/available-league.model';

type Tab = { label: string; leagueId: number | null };

const GENERAL_TAB: Tab = { label: 'General', leagueId: null };

@Component({
  selector: 'app-leaderboard-page',
  imports: [RouterLink],
  templateUrl: './leaderboard-page.html',
  styleUrl: './leaderboard-page.css',
})
export class LeaderboardPage {
  private readonly leaderboardService = inject(LeaderboardService);
  private readonly predictionsService = inject(PredictionsService);
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly tabs = signal<Tab[]>([GENERAL_TAB]);
  protected readonly activeTab = signal<Tab>(GENERAL_TAB);

  protected readonly entries = signal<LeaderboardEntry[] | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly ownRank = computed(() => {
    const user = this.currentUser();
    const rows = this.entries();
    if (!user || !rows) {
      return null;
    }
    return rows.find((entry) => entry.userId === user.id) ?? null;
  });

  constructor() {
    this.predictionsService.getAvailableLeagues().subscribe({
      next: (leagues: AvailableLeague[]) => {
        this.tabs.set([GENERAL_TAB, ...leagues.map((league) => ({ label: league.leagueName, leagueId: league.leagueId }))]);
      },
      // League tabs are a nice-to-have; the general ranking still works if this fails.
      error: () => this.tabs.set([GENERAL_TAB]),
    });

    this.loadLeaderboard(GENERAL_TAB);
  }

  protected selectTab(tab: Tab): void {
    if (tab.leagueId === this.activeTab().leagueId) {
      return;
    }
    this.activeTab.set(tab);
    this.loadLeaderboard(tab);
  }

  private loadLeaderboard(tab: Tab): void {
    this.entries.set(null);
    this.errorMessage.set(null);

    this.leaderboardService.getLeaderboard(tab.leagueId ?? undefined).subscribe({
      next: (entries) => this.entries.set(entries),
      error: (err: HttpErrorResponse) => {
        this.entries.set([]);
        this.errorMessage.set(err.status === 0 ? 'Could not reach the server.' : 'Could not load the leaderboard.');
      },
    });
  }
}
