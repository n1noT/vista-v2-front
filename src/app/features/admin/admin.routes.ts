/**
 * Route table for the admin feature: `/admin` (the dashboard overview),
 * `/admin/users` (players management) plus `/admin/users/:userId/predictions`
 * and `/admin/users/:userId/predictions/league/:leagueId` (viewing/editing
 * a specific player's standings prediction), and `/admin/teams` /
 * `/admin/leagues` / `/admin/seasons` (plus `/admin/seasons/:id` for
 * managing which teams participate in a season) — see
 * `Fonctionnalites_Admin.md`. All guarded by `adminGuard` so a non-admin
 * never even downloads the lazy-loaded chunks. `/admin/odds` and
 * `/admin/results` from `Arborescence_Pages.md` aren't built yet — they'll
 * get their own entries here once they exist.
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
  {
    path: 'teams',
    canActivate: [adminGuard],
    loadComponent: () => import('./teams/pages/admin-teams-page/admin-teams-page').then((m) => m.AdminTeamsPage),
  },
  {
    path: 'leagues',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./leagues/pages/admin-leagues-page/admin-leagues-page').then((m) => m.AdminLeaguesPage),
  },
  {
    path: 'seasons',
    pathMatch: 'full',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./seasons/pages/admin-seasons-page/admin-seasons-page').then((m) => m.AdminSeasonsPage),
  },
  {
    path: 'seasons/:id',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./seasons/pages/admin-season-detail-page/admin-season-detail-page').then(
        (m) => m.AdminSeasonDetailPage,
      ),
  },
];
