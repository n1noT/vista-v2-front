/**
 * Admin team-management API calls (`/admin/teams` — see
 * `AdminTeamsController` on the API). Kept feature-local like
 * `AdminUsersService`, not `core/`.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateTeamPayload, Team, UpdateTeamPayload } from './team.model';

@Injectable({ providedIn: 'root' })
export class AdminTeamsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/teams`;

  list(): Observable<Team[]> {
    return this.http.get<Team[]>(this.baseUrl);
  }

  create(payload: CreateTeamPayload): Observable<Team> {
    return this.http.post<Team>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateTeamPayload): Observable<Team> {
    return this.http.patch<Team>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
