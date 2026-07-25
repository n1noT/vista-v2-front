/**
 * `/admin` (guarded by `adminGuard` — see `admin.routes.ts`). The
 * `/admin/dashboard` overview from `Arborescence_Pages.md`: player counts
 * and per-championship season status, plus links into `/admin/users`,
 * `/admin/teams`, `/admin/leagues`, and `/admin/seasons` for the actual
 * management actions that live on those pages.
 */
import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminDashboardService } from '../../admin-dashboard.service';
import { DashboardOverview } from '../../dashboard-overview.model';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-dashboard-page.html',
})
export class AdminDashboardPage {
  private readonly dashboardService = inject(AdminDashboardService);

  protected readonly overview = signal<DashboardOverview | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.dashboardService.getOverview().subscribe({
      next: (overview) => {
        this.overview.set(overview);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load the dashboard.');
        this.loading.set(false);
      },
    });
  }
}
