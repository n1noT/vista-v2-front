/**
 * Admin championship-management API calls (`/admin/leagues` — see
 * `AdminLeaguesController` on the API). Kept feature-local like
 * `AdminUsersService`, not `core/`.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateLeaguePayload, League, UpdateLeaguePayload } from './league.model';

@Injectable({ providedIn: 'root' })
export class AdminLeaguesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/leagues`;

  list(): Observable<League[]> {
    return this.http.get<League[]>(this.baseUrl);
  }

  create(payload: CreateLeaguePayload): Observable<League> {
    return this.http.post<League>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateLeaguePayload): Observable<League> {
    return this.http.patch<League>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
