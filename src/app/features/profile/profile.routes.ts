/**
 * Route table for the profile feature: `/profile` (the logged-in user's own,
 * editable profile) and `/profile/:id` (a player's read-only profile —
 * `PublicProfilePage` renders the same view for `:id` === the viewer's own
 * id too, no redirect to `/profile`; see that component's header comment).
 * Both protected by `authGuard` so an anonymous visitor is redirected to
 * `/login` before either lazy-loaded component ever downloads.
 */
import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const profileRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/public-profile-page/public-profile-page').then((m) => m.PublicProfilePage),
  },
];
