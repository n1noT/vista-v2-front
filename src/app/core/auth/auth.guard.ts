/**
 * `CanActivateFn` for routes that require a logged-in user (currently just
 * `/profile`). Delegates the actual check to `AuthService.ensureSession()`
 * so it shares the same "only hit the network once" caching behavior rather
 * than re-implementing a session check here. On failure, returns a
 * `UrlTree` redirect to `/login?returnUrl=<attempted path>` — returning a
 * `UrlTree` (rather than `false` + a manual `router.navigate`) is the
 * idiomatic Angular way to redirect from inside a guard, since it lets the
 * router perform a single navigation instead of two.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService
    .ensureSession()
    .pipe(
      map((isAuthenticated) =>
        isAuthenticated ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }),
      ),
    );
};
