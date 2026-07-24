/**
 * `CanActivateFn` for routes that only make sense for a logged-out visitor
 * (`/login`, `/register`) — the inverse of `authGuard`. Reuses
 * `AuthService.ensureSession()` for the same cached, single-network-call
 * session check. On success (already authenticated), redirects to `/profile`
 * via a `UrlTree` rather than letting the user re-hit the login/register form.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService
    .ensureSession()
    .pipe(map((isAuthenticated) => (isAuthenticated ? router.createUrlTree(['/profile']) : true)));
};
