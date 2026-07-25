/**
 * Admin odds API calls (`/admin/odds` — see `AdminOddsController` on the
 * API). Kept as its own tiny feature-local service, mirroring the API's own
 * `admin/odds/` submodule split from `admin/seasons/`, even though both
 * ultimately edit fields on the same `TeamLeagueSeason` row — see
 * `Participation`'s header comment in `../seasons/season.model.ts`.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Participation } from '../seasons/season.model';

@Injectable({ providedIn: 'root' })
export class AdminOddsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/odds`;

  updateExpectedPosition(participationId: number, expectedPosition: number): Observable<Participation> {
    return this.http.patch<Participation>(`${this.baseUrl}/${participationId}`, { expectedPosition });
  }
}
