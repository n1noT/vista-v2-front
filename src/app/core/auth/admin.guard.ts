/**
 * `CanActivateFn` for admin-only routes (currently `/admin/users`).
 * Reuses `AuthService.ensureSession()` like `authGuard`, then additionally
 * requires `currentUser().role === 'ADMIN'`. Redirects a logged-out or
 * non-admin visitor to `/` via a `UrlTree` — there's no dedicated "forbidden"
 * page, and revealing that a route exists to a non-admin isn't a concern
 * here since the API enforces the same role check independently.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService
    .ensureSession()
    .pipe(
      map(() =>
        authService.currentUser()?.role === 'ADMIN' ? true : router.createUrlTree(['/']),
      ),
    );
};
