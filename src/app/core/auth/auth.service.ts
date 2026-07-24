/**
 * Single source of truth for auth/session state, shared app-wide via
 * `providedIn: 'root'`. Wraps the `/auth/*` and `/users/me` API calls and
 * keeps a `currentUser` signal in sync with the server's view of the session
 * so any component can read it reactively without re-fetching.
 *
 * - `register`/`login`/`logout` each update `currentUserSignal` as a `tap`
 *   side effect of a successful response — the cookie itself is opaque to
 *   this service (httpOnly, set/cleared by the API); this signal is just the
 *   client-side mirror of "are we logged in, and as whom."
 * - `fetchMe()` is the one method that never errors out to the caller: on a
 *   401 (no/invalid session) it resolves to `null` instead of throwing, since
 *   "not logged in" is an expected outcome when probing session state, not a
 *   failure.
 * - `ensureSession()` is the guard-friendly wrapper: it only hits the network
 *   once per app lifetime (via the `sessionChecked` flag) and just returns
 *   the cached `isAuthenticated()` value afterwards, so navigating between
 *   several guarded routes doesn't re-ping `/users/me` every time.
 * - `setCurrentUser()` exists so `ProfileService` (a different feature) can
 *   push an updated user back into this shared signal after a successful
 *   profile edit, without this service needing to know about profile editing.
 */
import { computed, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginPayload, RegisterPayload, User } from './user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserSignal = signal<User | null>(null);
  private sessionChecked = false;

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<User>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  login(payload: LoginPayload): Observable<User> {
    return this.http
      .post<User>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${environment.apiUrl}/auth/logout`, {})
      .pipe(tap(() => this.currentUserSignal.set(null)));
  }

  /** Populates currentUser from the session cookie, if any. Never errors. */
  fetchMe(): Observable<User | null> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap((user) => this.currentUserSignal.set(user)),
      catchError(() => {
        this.currentUserSignal.set(null);
        return of(null);
      }),
      tap(() => (this.sessionChecked = true)),
    );
  }

  /** Like fetchMe(), but skips the network call once the session has already been resolved. */
  ensureSession(): Observable<boolean> {
    if (this.sessionChecked) {
      return of(this.isAuthenticated());
    }
    return this.fetchMe().pipe(map((user) => user !== null));
  }

  setCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
  }
}
