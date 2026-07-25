/**
 * Route table for the admin feature: `/admin` (the dashboard overview),
 * `/admin/users` (players management), and `/admin/users/:userId/predictions`
 * plus `/admin/users/:userId/predictions/league/:leagueId` (viewing/editing
 * a specific player's standings prediction — see `Fonctionnalites_Admin.md`).
 * All guarded by `adminGuard` so a non-admin never even downloads the
 * lazy-loaded chunks. Other `/admin/*` pages from `Arborescence_Pages.md`
 * (seasons, odds, results) aren't built yet — they'll get their own entries
 * here once they exist.
 */
import { Routes } from '@angular/router';
import { adminGuard } from '../../core/auth/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./dashboard/pages/admin-dashboard-page/admin-dashboard-page').then((m) => m.AdminDashboardPage),
  },
  {
    path: 'users',
    canActivate: [adminGuard],
    loadComponent: () => import('./users/pages/admin-users-page/admin-users-page').then((m) => m.AdminUsersPage),
  },
  {
    path: 'users/:userId/predictions',
    pathMatch: 'full',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./predictions/pages/admin-player-predictions-hub/admin-player-predictions-hub').then(
        (m) => m.AdminPlayerPredictionsHub,
      ),
  },
  {
    path: 'users/:userId/predictions/league/:leagueId',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./predictions/pages/admin-player-prediction-page/admin-player-prediction-page').then(
        (m) => m.AdminPlayerPredictionPage,
      ),
  },
];
