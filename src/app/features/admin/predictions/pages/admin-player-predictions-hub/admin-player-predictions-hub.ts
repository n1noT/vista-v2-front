/**
 * `/admin/users/:userId/predictions` (guarded by `adminGuard` — see
 * `admin.routes.ts`). Admin counterpart to `PredictionsHub`: lists the same
 * domestic-league championships, but with the *target player's* progress on
 * each (`AdminPredictionsService.getAvailableLeagues(userId)`) rather than
 * the acting admin's own. Also fetches the target player themselves
 * (`AdminUsersService.get`) purely to show whose grid this is — the API
 * doesn't need it, `getAvailableLeagues` already scopes by the route's
 * `:userId`. Champions League entries are omitted entirely (unlike
 * `PredictionsHub`, which links to them as static placeholders) since
 * there's nothing yet to edit there — no point offering an admin a dead end.
 */
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminPredictionsService } from '../../admin-predictions.service';
import { AdminUsersService } from '../../../users/admin-users.service';
import { AvailableLeague } from '../../../../predictions/available-league.model';
import { User } from '../../../../../core/auth/user.model';

@Component({
  selector: 'app-admin-player-predictions-hub',
  imports: [RouterLink],
  templateUrl: './admin-player-predictions-hub.html',
})
export class AdminPlayerPredictionsHub {
  private readonly route = inject(ActivatedRoute);
  private readonly adminPredictionsService = inject(AdminPredictionsService);
  private readonly adminUsersService = inject(AdminUsersService);

  protected readonly userId = this.route.snapshot.paramMap.get('userId')!;
  protected readonly player = signal<User | null>(null);
  protected readonly leagues = signal<AvailableLeague[] | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.adminUsersService
      .get(this.userId)
      .pipe(
        tap((player) => this.player.set(player)),
        switchMap(() => this.adminPredictionsService.getAvailableLeagues(this.userId)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (leagues) => this.leagues.set(leagues),
        error: (err: HttpErrorResponse) => {
          this.leagues.set([]);
          this.errorMessage.set(err.status === 404 ? 'Player not found.' : 'Could not load championships.');
        },
      });
  }
}
