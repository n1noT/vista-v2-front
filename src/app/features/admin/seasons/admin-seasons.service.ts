/**
 * Admin season-management API calls (`/admin/seasons` — see
 * `AdminSeasonsController` on the API), including the team↔league-season
 * join (`:id/teams*`). Kept feature-local like `AdminUsersService`, not
 * `core/`.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AddTeamToSeasonPayload,
  CreateSeasonPayload,
  Participation,
  Season,
  SeasonDetail,
  UpdateParticipationPayload,
  UpdateSeasonPayload,
} from './season.model';

@Injectable({ providedIn: 'root' })
export class AdminSeasonsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/seasons`;

  list(): Observable<Season[]> {
    return this.http.get<Season[]>(this.baseUrl);
  }

  get(id: number): Observable<SeasonDetail> {
    return this.http.get<SeasonDetail>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateSeasonPayload): Observable<Season> {
    return this.http.post<Season>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateSeasonPayload): Observable<Season> {
    return this.http.patch<Season>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addTeam(seasonId: number, payload: AddTeamToSeasonPayload): Observable<Participation> {
    return this.http.post<Participation>(`${this.baseUrl}/${seasonId}/teams`, payload);
  }

  updateParticipation(
    seasonId: number,
    participationId: number,
    payload: UpdateParticipationPayload,
  ): Observable<Participation> {
    return this.http.patch<Participation>(`${this.baseUrl}/${seasonId}/teams/${participationId}`, payload);
  }

  removeParticipation(seasonId: number, participationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${seasonId}/teams/${participationId}`);
  }
}
