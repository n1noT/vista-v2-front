/**
 * `/admin/leagues` (guarded by `adminGuard` — see `admin.routes.ts`).
 * `Fonctionnalites_Admin.md` "Championnats": add/edit/delete a league.
 * Structurally identical to `admin-teams-page.ts` — see that file's header
 * comment for the interaction shape (inline edit, add form, delete behind
 * `ConfirmModal`, 409-in-use surfaced verbatim, `externalId` editable to
 * attach a real football-data.org id).
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminLeaguesService } from '../../admin-leagues.service';
import { League } from '../../league.model';
import { ConfirmModal } from '../../../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-admin-leagues-page',
  imports: [ReactiveFormsModule, RouterLink, ConfirmModal],
  templateUrl: './admin-leagues-page.html',
})
export class AdminLeaguesPage {
  private readonly fb = inject(FormBuilder);
  private readonly adminLeaguesService = inject(AdminLeaguesService);

  protected readonly leagues = signal<League[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly creating = signal(false);
  protected readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    logoUrl: [''],
  });

  protected readonly editingId = signal<number | null>(null);
  protected readonly savingEdit = signal(false);
  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    logoUrl: [''],
    externalId: [0, [Validators.required]],
  });

  protected readonly deleteTarget = signal<League | null>(null);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target ? `Delete "${target.name}"? This cannot be undone.` : '';
  });

  constructor() {
    this.fetch();
  }

  protected createLeague(): void {
    if (this.createForm.invalid || this.creating()) {
      return;
    }
    this.creating.set(true);
    this.errorMessage.set(null);
    const { name, logoUrl } = this.createForm.getRawValue();

    this.adminLeaguesService.create({ name, logoUrl: logoUrl || undefined }).subscribe({
      next: (league) => {
        this.leagues.update((list) => [...list, league].sort((a, b) => a.name.localeCompare(b.name)));
        this.creating.set(false);
        this.createForm.reset({ name: '', logoUrl: '' });
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not create league.'));
      },
    });
  }

  protected startEditing(league: League): void {
    this.errorMessage.set(null);
    this.editingId.set(league.id);
    this.editForm.setValue({ name: league.name, logoUrl: league.logoUrl ?? '', externalId: league.externalId });
  }

  protected cancelEditing(): void {
    this.editingId.set(null);
  }

  protected saveEdit(league: League): void {
    if (this.editForm.invalid || this.savingEdit()) {
      return;
    }
    this.savingEdit.set(true);
    this.errorMessage.set(null);
    const { name, logoUrl, externalId } = this.editForm.getRawValue();

    this.adminLeaguesService.update(league.id, { name, logoUrl: logoUrl || undefined, externalId }).subscribe({
      next: (updated) => {
        this.leagues.update((list) => list.map((l) => (l.id === updated.id ? updated : l)));
        this.savingEdit.set(false);
        this.editingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.savingEdit.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not save changes.'));
      },
    });
  }

  protected confirmDelete(league: League): void {
    this.deleteTarget.set(league);
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected deleteConfirmed(): void {
    const league = this.deleteTarget();
    if (!league) {
      return;
    }
    this.pendingDeleteId.set(league.id);
    this.errorMessage.set(null);

    this.adminLeaguesService.delete(league.id).subscribe({
      next: () => {
        this.leagues.update((list) => list.filter((l) => l.id !== league.id));
        this.pendingDeleteId.set(null);
        this.deleteTarget.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.pendingDeleteId.set(null);
        this.deleteTarget.set(null);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not delete league.'));
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
    this.adminLeaguesService.list().subscribe({
      next: (leagues) => {
        this.leagues.set(leagues);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load leagues.');
        this.loading.set(false);
      },
    });
  }
}
