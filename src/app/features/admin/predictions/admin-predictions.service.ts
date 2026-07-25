/**
 * Admin prediction-editing API calls (`/admin/users/:userId/predictions*` —
 * see `AdminPredictionsController` on the API). Mirrors
 * `features/predictions/predictions.service.ts` method-for-method, just
 * parameterized by an arbitrary `userId` instead of always meaning "the
 * logged-in player." `getLeagueDetail` is the one exception — it hits the
 * *player-facing* `GET /predictions/leagues/:leagueId` endpoint directly,
 * since that data isn't user-scoped (any authenticated caller, including an
 * admin, can already read it) and duplicating it under `/admin/*` would add
 * nothing.
 *
 * Reuses `features/predictions`'s model types (`AvailableLeague`,
 * `LeagueDetail`, `Prediction`, `CUPredictionsPayload`) rather than
 * redeclaring identical interfaces — the API shapes are exactly the same,
 * only the URL/ownership differs.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AvailableLeague } from '../../predictions/available-league.model';
import { LeagueDetail } from '../../predictions/league-detail.model';
import { CUPredictionsPayload, Prediction } from '../../predictions/prediction.model';

@Injectable({ providedIn: 'root' })
export class AdminPredictionsService {
  private readonly http = inject(HttpClient);

  private baseUrl(userId: string): string {
    return `${environment.apiUrl}/admin/users/${userId}/predictions`;
  }

  getAvailableLeagues(userId: string): Observable<AvailableLeague[]> {
    return this.http.get<AvailableLeague[]>(`${this.baseUrl(userId)}/leagues`);
  }

  getLeagueDetail(leagueId: number): Observable<LeagueDetail> {
    return this.http.get<LeagueDetail>(`${environment.apiUrl}/predictions/leagues/${leagueId}`);
  }

  getPrediction(userId: string, leagueId: number, seasonId: number): Observable<Prediction | null> {
    return this.http.get<Prediction | null>(this.baseUrl(userId), {
      params: { leagueId, seasonId },
    });
  }

  saveDraft(userId: string, payload: CUPredictionsPayload): Observable<Prediction> {
    return this.http.post<Prediction>(`${this.baseUrl(userId)}/draft`, payload);
  }

  submit(userId: string, payload: CUPredictionsPayload): Observable<Prediction> {
    return this.http.post<Prediction>(`${this.baseUrl(userId)}/submit`, payload);
  }
}
