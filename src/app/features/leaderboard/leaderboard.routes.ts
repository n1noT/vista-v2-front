/**
 * Route table for the leaderboard feature: just the single `/leaderboard`
 * page, guarded by `authGuard` like `/profile`/`/predictions` — the
 * ranking is player-facing, not public.
 */
import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const leaderboardRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/leaderboard-page/leaderboard-page').then((m) => m.LeaderboardPage),
  },
];
