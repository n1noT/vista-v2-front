/**
 * Registered globally in `app.config.ts` via `withInterceptors`. The front
 * (`:4200`) and the API (`:3000`) are different origins, so by default the
 * browser won't attach cookies to cross-origin `fetch`/`XHR` calls — that
 * requires `withCredentials: true` on the request. Rather than repeat that
 * on every `HttpClient` call site, this interceptor adds it automatically,
 * but only for requests actually going to our API (`environment.apiUrl`);
 * anything else passes through untouched so we don't leak the cookie to
 * unrelated third-party requests some future feature might make.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return next(req.clone({ withCredentials: true }));
};
