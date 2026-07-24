/**
 * Profile-editing API calls, kept feature-local (not in `core/`) since
 * nothing outside the profile feature needs it yet. `updatePseudo` PATCHes
 * `/users/me` and, on success, pushes the updated user into
 * `AuthService.setCurrentUser` so the shared `currentUser` signal (and
 * anything reading it, like the profile page itself) reflects the change
 * immediately without a separate re-fetch.
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/auth/user.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  updatePseudo(pseudo: string): Observable<User> {
    return this.http
      .patch<User>(`${environment.apiUrl}/users/me`, { pseudo })
      .pipe(tap((user) => this.authService.setCurrentUser(user)));
  }
}
