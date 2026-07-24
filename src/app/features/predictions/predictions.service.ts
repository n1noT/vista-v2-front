/**
 * API calls for the predictions feature, kept feature-local (not in
 * `core/`) since nothing outside `/predictions/*` needs them yet.
 * `getAvailableLeagues` backs the `/predictions` hub — it lists the
 * championships that currently have standings data to predict on. Hits the
 * API's `GET /leagues` (its own `LeaguesModule`, not nested under
 * `/predictions`), kept here rather than a separate front-end feature since
 * this hub is still the only consumer.
 *
 * `getLeagueDetail`/`getOwnPrediction`/`saveDraft`/`submit` back the
 * `/predictions/league/[id]` form: the first two fetch what's needed to
 * render it (team list + any existing draft/submission to prefill), the
 * last two persist it — `saveDraft` and `submit` are separate API routes
 * (`POST /predictions/draft|submit`) rather than one endpoint with a status
 * flag, matching `PredictionsController`.
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvailableLeague } from './available-league.model';
import { LeagueDetail } from './league-detail.model';
import { CUPredictionsPayload, Prediction } from './prediction.model';

@Injectable({ providedIn: 'root' })
export class PredictionsService {
  private readonly http = inject(HttpClient);

  getAvailableLeagues(): Observable<AvailableLeague[]> {
    return this.http.get<AvailableLeague[]>(`${environment.apiUrl}/leagues`);
  }

  getLeagueDetail(leagueId: number): Observable<LeagueDetail> {
    return this.http.get<LeagueDetail>(`${environment.apiUrl}/leagues/${leagueId}`);
  }

  getOwnPrediction(leagueId: number, seasonId: number): Observable<Prediction | null> {
    return this.http.get<Prediction | null>(`${environment.apiUrl}/predictions`, {
      params: { leagueId, seasonId },
    });
  }

  saveDraft(payload: CUPredictionsPayload): Observable<Prediction> {
    return this.http.post<Prediction>(`${environment.apiUrl}/predictions/draft`, payload);
  }

  submit(payload: CUPredictionsPayload): Observable<Prediction> {
    return this.http.post<Prediction>(`${environment.apiUrl}/predictions/submit`, payload);
  }
}
