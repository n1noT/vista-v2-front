/**
 * Route table for the profile feature — currently just `/profile` itself,
 * protected by `authGuard` so an anonymous visitor is redirected to
 * `/login` before the (lazy-loaded) `ProfilePage` component ever downloads.
 */
import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const profileRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
  },
];
