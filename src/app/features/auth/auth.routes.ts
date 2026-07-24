/**
 * Child routes for the auth feature: `/login` and `/register`. Both use
 * `loadComponent` (not `loadChildren`, since each is a single standalone
 * component, not a nested route table) so their component code splits into
 * its own chunk and only downloads when the user actually visits that path.
 * Both are protected by `guestGuard`, which redirects an already-authenticated
 * visitor to `/profile` instead of letting them re-hit the login/register form.
 */
import { Routes } from '@angular/router';
import { guestGuard } from '../../core/auth/guest.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage),
  },
];
