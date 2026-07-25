/**
 * `/admin` (guarded by `adminGuard` — see `admin.routes.ts`). The
 * `/admin/dashboard` overview from `Arborescence_Pages.md`: player counts
 * and per-championship season status, plus links into `/admin/users`,
 * `/admin/teams`, `/admin/leagues`, and `/admin/seasons` for the actual
 * management actions that live on those pages.
 *
 * Also hosts the "Sync now" button — forces a football-data.org sync run
 * on demand (`POST /admin/sync`, `AdminSyncService`) instead of waiting for
 * the daily `@Cron` job (`FootballSyncService.handleCron`, still registered
 * and unchanged — this is a second caller of the same `syncAll()`, not a
 * replacement). On success the dashboard's championship data is stale until
 * re-fetched, so `triggerSync` re-runs `fetchOverview()` afterward rather
 * than requiring a manual page reload.
 */
import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminDashboardService } from '../../admin-dashboard.service';
import { AdminSyncService } from '../../../sync/admin-sync.service';
import { DashboardOverview } from '../../dashboard-overview.model';
import { SyncResult } from '../../../sync/sync-result.model';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-dashboard-page.html',
})
export class AdminDashboardPage {
  private readonly dashboardService = inject(AdminDashboardService);
  private readonly adminSyncService = inject(AdminSyncService);

  protected readonly overview = signal<DashboardOverview | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly syncing = signal(false);
  protected readonly syncResult = signal<SyncResult | null>(null);
  protected readonly syncError = signal<string | null>(null);

  constructor() {
    this.fetchOverview();
  }

  protected triggerSync(): void {
    if (this.syncing()) {
      return;
    }
    this.syncing.set(true);
    this.syncResult.set(null);
    this.syncError.set(null);

    this.adminSyncService.sync().subscribe({
      next: (result) => {
        this.syncResult.set(result);
        this.syncing.set(false);
        this.fetchOverview();
      },
      error: () => {
        this.syncError.set('Could not reach football-data.org.');
        this.syncing.set(false);
      },
    });
  }

  private fetchOverview(): void {
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
