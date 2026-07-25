/**
 * Single call to `GET /admin/dashboard`, kept feature-local like
 * `AdminUsersService` — nothing outside `features/admin` needs it.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardOverview } from './dashboard-overview.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);

  getOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${environment.apiUrl}/admin/dashboard`);
  }
}
