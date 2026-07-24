/**
 * `DraggableLeagueTable` — per `vista-v2-docs/02_Frontend_UI/Composants_Cles.md`,
 * the core standings-prediction widget: a numbered list of teams the player
 * reorders via drag-and-drop to predict a championship's final table.
 * Deliberately shared (not page-local) since the docs call out that the
 * league-phase Champions League predictor reuses the exact same interaction
 * — this component takes no league-specific logic, only a team list.
 *
 * `teams` is a `model()` so the parent page owns the array (and its
 * eventual submission) while this component only reorders it in place via
 * `@angular/cdk/drag-drop`'s `moveItemInArray`. `readOnly` disables dragging
 * and hides the grip handle, per the doc's "Verrouillage" behavior — the
 * parent decides *why* (submitted vs. deadline passed), this component just
 * renders the resulting state.
 *
 * The spec also calls for an odds ("cote") column per position; that needs
 * the odds engine from `Calcul_Cotes.md`, not modeled in the schema yet, so
 * it's omitted here until that data exists.
 */
import { Component, input, model } from '@angular/core';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LeagueTeamStanding } from '../../league-detail.model';

@Component({
  selector: 'app-draggable-league-table',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './draggable-league-table.html',
})
export class DraggableLeagueTable {
  readonly teams = model.required<LeagueTeamStanding[]>();
  readonly readOnly = input(false);

  protected drop(event: CdkDragDrop<LeagueTeamStanding[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const next = this.teams().slice();
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.teams.set(next);
  }
}
