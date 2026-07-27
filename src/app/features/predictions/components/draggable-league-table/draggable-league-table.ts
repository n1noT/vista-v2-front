/**
 * `DraggableLeagueTable` — per `vista-v2-docs/02_Frontend_UI/Composants_Cles.md`,
 * the core standings-prediction widget. Two connected `cdkDropList`s: an
 * "unranked" pool (`allTeams` minus whatever's already in `ranked`, in
 * alphabetical order so the real table doesn't visually anchor the
 * prediction) and the "ranked" list the player builds by dragging teams
 * across — position is simply the team's index in `ranked`. Dragging a team
 * back from `ranked` to the pool un-ranks it; dragging within either list
 * reorders it. Deliberately shared (not page-local) since the docs call out
 * that the league-phase Champions League predictor reuses the exact same
 * interaction — this component takes no league-specific logic, only team
 * lists.
 *
 * `ranked` is a `model()` so the parent page owns the array (and its
 * eventual submission); `pool` is derived internally (an `effect`, not a
 * `computed`, since it needs its own settable signal for
 * `moveItemInArray`/`transferArrayItem` to mutate a *copy* of during a
 * same-list reorder — the parent never needs to see the pool). `readOnly`
 * disables dragging, per the doc's "Verrouillage" behavior — the parent
 * decides *why* (submitted vs. deadline passed), this component just
 * renders the resulting state. `hidePool` additionally drops the pool
 * section from the layout entirely — the parent passes `true` once the
 * prediction is `SUBMITTED` (always fully ranked, so the pool is always
 * empty by then and just wastes space), but *not* merely for `readOnly`'s
 * other case (deadline passed on an incomplete prediction), where the pool
 * still has content worth showing.
 *
 * Each ranked row also shows a potential-points badge, via the shared
 * `placementPreview` util (see its header comment for the formula) — the
 * points the player would get if this placement turns out exactly right.
 * `null` when a team has no `expectedPosition` set yet — no badge, not a
 * fake number. The unranked pool never shows this since those teams have
 * no position. `ChampionshipPredictionPage` uses the same util to total
 * these badges into a header summary, hence it living outside this
 * component rather than as a private method here.
 *
 * `showRealPosition` additionally renders each ranked row's true/live
 * standing (`team.position`, from `TeamLeagueSeason.position` — kept fresh
 * by the daily football-data sync) next to the guessed slot, so a player can
 * see how their locked-in prediction compares to reality. The parent passes
 * `true` only once `SUBMITTED` (same condition as `hidePool`) — before that,
 * the ranking is still just the player's own guess, not yet worth comparing.
 */
import { Component, effect, input, model, signal } from '@angular/core';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { LeagueTeamStanding } from '../../league-detail.model';
import { placementPreview } from '../../potential-points.util';

@Component({
  selector: 'app-draggable-league-table',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './draggable-league-table.html',
})
export class DraggableLeagueTable {
  readonly allTeams = input.required<LeagueTeamStanding[]>();
  readonly ranked = model.required<LeagueTeamStanding[]>();
  readonly readOnly = input(false);
  readonly hidePool = input(false);
  readonly showRealPosition = input(false);

  protected readonly pool = signal<LeagueTeamStanding[]>([]);

  constructor() {
    effect(() => {
      const rankedIds = new Set(this.ranked().map((team) => team.teamId));
      this.pool.set(
        this.allTeams()
          .filter((team) => !rankedIds.has(team.teamId))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    });
  }

  protected dropOnPool(event: CdkDragDrop<LeagueTeamStanding[]>): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) {
        return;
      }
      const next = this.pool().slice();
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      this.pool.set(next);
      return;
    }
    const poolNext = this.pool().slice();
    const rankedNext = this.ranked().slice();
    transferArrayItem(rankedNext, poolNext, event.previousIndex, event.currentIndex);
    this.pool.set(poolNext);
    this.ranked.set(rankedNext);
  }

  protected placementPreview(team: LeagueTeamStanding, index: number) {
    return placementPreview(team.expectedPosition, index + 1, this.allTeams().length);
  }

  protected dropOnRanked(event: CdkDragDrop<LeagueTeamStanding[]>): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) {
        return;
      }
      const next = this.ranked().slice();
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      this.ranked.set(next);
      return;
    }
    const poolNext = this.pool().slice();
    const rankedNext = this.ranked().slice();
    transferArrayItem(poolNext, rankedNext, event.previousIndex, event.currentIndex);
    this.pool.set(poolNext);
    this.ranked.set(rankedNext);
  }
}
