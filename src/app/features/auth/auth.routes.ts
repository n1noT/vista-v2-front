/**
 * Child routes for the auth feature: `/login` and `/register`. Both use
 * `loadComponent` (not `loadChildren`, since each is a single standalone
 * component, not a nested route table) so their component code splits into
 * its own chunk and only downloads when the user actually visits that path.
 * Neither route is guarded — that's the point, they're how you get a session
 * in the first place.
 */
import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage),
  },
];
