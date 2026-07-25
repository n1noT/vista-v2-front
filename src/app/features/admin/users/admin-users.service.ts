/**
 * Admin players-management API calls (`/admin/users` — see
 * `AdminUsersController` on the API). Kept feature-local like
 * `ProfileService`, not `core/`, since nothing outside `features/admin`
 * needs it. Unlike `ProfileService`, none of these calls touch
 * `AuthService.currentUser` — the acting admin's own session is unaffected
 * by editing/banning/deleting *other* users.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Role, User } from '../../../core/auth/user.model';

export interface UpdatePlayerPayload {
  pseudo?: string;
  email?: string;
  avatarUrl?: string;
  role?: Role;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/users`;

  list(search?: string): Observable<User[]> {
    const params = search ? new HttpParams().set('search', search) : undefined;
    return this.http.get<User[]>(this.baseUrl, { params });
  }

  update(id: string, payload: UpdatePlayerPayload): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, payload);
  }

  changeRole(id: string, role: Role): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, { role });
  }

  ban(id: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/${id}/ban`, {});
  }

  unban(id: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/${id}/unban`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
