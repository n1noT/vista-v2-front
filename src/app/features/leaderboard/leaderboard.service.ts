/**
 * API calls for the leaderboard feature, kept feature-local (not in
 * `core/`) since nothing outside `/leaderboard` needs them yet.
 * `getLeaderboard` backs both the global ranking (no `leagueId`) and the
 * per-competition tabs (`leagueId` set) on `GET /leaderboard`.
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaderboardEntry } from './leaderboard.model';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly http = inject(HttpClient);

  getLeaderboard(leagueId?: number): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${environment.apiUrl}/leaderboard`, {
      params: leagueId ? { leagueId } : {},
    });
  }
}
