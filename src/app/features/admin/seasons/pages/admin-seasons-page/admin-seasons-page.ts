/**
 * `/admin/seasons` (guarded by `adminGuard` — see `admin.routes.ts`).
 * `Fonctionnalites_Admin.md` "Saison": add/edit/delete a season. Same
 * interaction shape as `admin-teams-page.ts` (inline edit, add form, delete
 * behind `ConfirmModal`, 409-in-use surfaced verbatim), plus a "Manage
 * teams" link per row into `/admin/seasons/:id`
 * (`admin-season-detail-page.ts`) for the team↔league-season join, which is
 * season-scoped rather than list-scoped.
 *
 * Date fields use `<input type="date">` (`YYYY-MM-DD`), sent to the API
 * as-is — `@IsDateString()` on the API's DTOs accepts a bare calendar date
 * as valid ISO 8601, and `new Date('YYYY-MM-DD')` parses it correctly
 * server-side (see `AdminSeasonsService.create` on the API). `externalId`
 * is editable in the edit form to attach a real football-data.org id to a
 * manually-created season — see `UpdateSeasonDto`'s header comment on the
 * API for the full reasoning.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminSeasonsService } from '../../admin-seasons.service';
import { Season } from '../../season.model';
import { ConfirmModal } from '../../../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-admin-seasons-page',
  imports: [ReactiveFormsModule, DatePipe, RouterLink, ConfirmModal],
  templateUrl: './admin-seasons-page.html',
})
export class AdminSeasonsPage {
  private readonly fb = inject(FormBuilder);
  private readonly adminSeasonsService = inject(AdminSeasonsService);

  protected readonly seasons = signal<Season[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly creating = signal(false);
  protected readonly createForm = this.fb.nonNullable.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    currentMatchday: [1, [Validators.required, Validators.min(1)]],
    isCurrent: [false],
  });

  protected readonly editingId = signal<number | null>(null);
  protected readonly savingEdit = signal(false);
  protected readonly editForm = this.fb.nonNullable.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    currentMatchday: [1, [Validators.required, Validators.min(1)]],
    isCurrent: [false],
    externalId: [0, [Validators.required]],
  });

  protected readonly deleteTarget = signal<Season | null>(null);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target ? `Delete this season (${target.startDate.slice(0, 10)} – ${target.endDate.slice(0, 10)})? This cannot be undone.` : '';
  });

  constructor() {
    this.fetch();
  }

  protected createSeason(): void {
    if (this.createForm.invalid || this.creating()) {
      return;
    }
    this.creating.set(true);
    this.errorMessage.set(null);

    this.adminSeasonsService.create(this.createForm.getRawValue()).subscribe({
      next: (season) => {
        this.seasons.update((list) => [season, ...list]);
        this.creating.set(false);
        this.createForm.reset({ startDate: '', endDate: '', currentMatchday: 1, isCurrent: false });
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not create season.'));
      },
    });
  }

  protected startEditing(season: Season): void {
    this.errorMessage.set(null);
    this.editingId.set(season.id);
    this.editForm.setValue({
      startDate: season.startDate.slice(0, 10),
      endDate: season.endDate.slice(0, 10),
      currentMatchday: season.currentMatchday,
      isCurrent: season.isCurrent,
      externalId: season.externalId,
    });
  }

  protected cancelEditing(): void {
    this.editingId.set(null);
  }

  protected saveEdit(season: Season): void {
    if (this.editForm.invalid || this.savingEdit()) {
      return;
    }
    this.savingEdit.set(true);
    this.errorMessage.set(null);

    this.adminSeasonsService.update(season.id, this.editForm.getRawValue()).subscribe({
      next: (updated) => {
        this.seasons.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        this.savingEdit.set(false);
        this.editingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.savingEdit.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not save changes.'));
      },
    });
  }

  protected confirmDelete(season: Season): void {
    this.deleteTarget.set(season);
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected deleteConfirmed(): void {
    const season = this.deleteTarget();
    if (!season) {
      return;
    }
    this.pendingDeleteId.set(season.id);
    this.errorMessage.set(null);

    this.adminSeasonsService.delete(season.id).subscribe({
      next: () => {
        this.seasons.update((list) => list.filter((s) => s.id !== season.id));
        this.pendingDeleteId.set(null);
        this.deleteTarget.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.pendingDeleteId.set(null);
        this.deleteTarget.set(null);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not delete season.'));
      },
    });
  }

  private extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const message: unknown = err.error?.message;
    return typeof message === 'string' ? message : fallback;
  }

  private fetch(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.adminSeasonsService.list().subscribe({
      next: (seasons) => {
        this.seasons.set(seasons);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load seasons.');
        this.loading.set(false);
      },
    });
  }
}
