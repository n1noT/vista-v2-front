/**
 * Top-level route table. `''` is the public landing page (Hallmark-built,
 * see features/landing/). Auth, profile, predictions, and admin are
 * lazy-loaded via `loadChildren` so their code isn't part of the initial
 * bundle until the user actually navigates there. Each is nested under its
 * own `*Routes` (rather than declared inline here) so the `authGuard`/
 * `adminGuard` that protects it lives next to the feature it protects.
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/landing/pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then((m) => m.profileRoutes),
  },
  {
    path: 'predictions',
    loadChildren: () => import('./features/predictions/predictions.routes').then((m) => m.predictionsRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
];
