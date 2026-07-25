/**
 * Single call to `POST /admin/sync` — forces a football-data.org sync run
 * on demand (`AdminSyncController` on the API), reusing the same
 * `FootballSyncService.syncAll()` the daily cron job calls. Kept
 * feature-local like the other admin services, not `core/`.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SyncResult } from './sync-result.model';

@Injectable({ providedIn: 'root' })
export class AdminSyncService {
  private readonly http = inject(HttpClient);

  sync(): Observable<SyncResult> {
    return this.http.post<SyncResult>(`${environment.apiUrl}/admin/sync`, {});
  }
}
