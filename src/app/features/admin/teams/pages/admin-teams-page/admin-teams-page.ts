/**
 * `/admin/teams` (guarded by `adminGuard` — see `admin.routes.ts`).
 * `Fonctionnalites_Admin.md` "Équipes": add/edit/delete a team. Same
 * interaction shape as `admin-users-page.ts` (inline edit row, delete
 * behind the shared `ConfirmModal`), plus a small "add team" form pinned at
 * the top since creation is in scope here (unlike players, which are only
 * ever created via `/register`).
 *
 * Delete can 409 if the team is still referenced by a season participation
 * or a prediction (`AdminTeamsService.remove` on the API) — that message is
 * surfaced as-is via `extractErrorMessage` rather than a generic fallback,
 * since it tells the admin exactly what to clean up first.
 *
 * The edit form's `externalId` field is how an admin attaches a real
 * football-data.org id to a manually-created team (synthetic negative id)
 * so `FootballSyncService` starts tracking it — see `UpdateTeamDto`'s
 * header comment on the API for the full reasoning. A collision with an
 * already-synced team surfaces the same way as any other 409 here.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminTeamsService } from '../../admin-teams.service';
import { Team } from '../../team.model';
import { ConfirmModal } from '../../../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-admin-teams-page',
  imports: [ReactiveFormsModule, RouterLink, ConfirmModal],
  templateUrl: './admin-teams-page.html',
})
export class AdminTeamsPage {
  private readonly fb = inject(FormBuilder);
  private readonly adminTeamsService = inject(AdminTeamsService);

  protected readonly teams = signal<Team[]>([]);
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

  protected readonly deleteTarget = signal<Team | null>(null);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target ? `Delete "${target.name}"? This cannot be undone.` : '';
  });

  constructor() {
    this.fetch();
  }

  protected createTeam(): void {
    if (this.createForm.invalid || this.creating()) {
      return;
    }
    this.creating.set(true);
    this.errorMessage.set(null);
    const { name, logoUrl } = this.createForm.getRawValue();

    this.adminTeamsService.create({ name, logoUrl: logoUrl || undefined }).subscribe({
      next: (team) => {
        this.teams.update((list) => [...list, team].sort((a, b) => a.name.localeCompare(b.name)));
        this.creating.set(false);
        this.createForm.reset({ name: '', logoUrl: '' });
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not create team.'));
      },
    });
  }

  protected startEditing(team: Team): void {
    this.errorMessage.set(null);
    this.editingId.set(team.id);
    this.editForm.setValue({ name: team.name, logoUrl: team.logoUrl ?? '', externalId: team.externalId });
  }

  protected cancelEditing(): void {
    this.editingId.set(null);
  }

  protected saveEdit(team: Team): void {
    if (this.editForm.invalid || this.savingEdit()) {
      return;
    }
    this.savingEdit.set(true);
    this.errorMessage.set(null);
    const { name, logoUrl, externalId } = this.editForm.getRawValue();

    this.adminTeamsService.update(team.id, { name, logoUrl: logoUrl || undefined, externalId }).subscribe({
      next: (updated) => {
        this.teams.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.savingEdit.set(false);
        this.editingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.savingEdit.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not save changes.'));
      },
    });
  }

  protected confirmDelete(team: Team): void {
    this.deleteTarget.set(team);
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected deleteConfirmed(): void {
    const team = this.deleteTarget();
    if (!team) {
      return;
    }
    this.pendingDeleteId.set(team.id);
    this.errorMessage.set(null);

    this.adminTeamsService.delete(team.id).subscribe({
      next: () => {
        this.teams.update((list) => list.filter((t) => t.id !== team.id));
        this.pendingDeleteId.set(null);
        this.deleteTarget.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.pendingDeleteId.set(null);
        this.deleteTarget.set(null);
        this.errorMessage.set(this.extractErrorMessage(err, 'Could not delete team.'));
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
    this.adminTeamsService.list().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load teams.');
        this.loading.set(false);
      },
    });
  }
}
