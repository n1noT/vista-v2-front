/**
 * `/admin/users` (guarded by `adminGuard` — see `admin.routes.ts`). Lists
 * every player (`GET /admin/users`, optionally filtered by `search`) with
 * per-row actions: inline edit (pseudo/email — same
 * `ReactiveFormsModule` pattern as `profile-page.ts` but one form instance
 * reused across whichever row is being edited; avatarUrl isn't exposed here
 * for the same reason `profile-page.ts` doesn't edit it either — no upload
 * strategy yet, even though the API's `UpdateUserAdminDto` already accepts
 * it), ban/unban and role toggle (both instant — reversible, so no
 * confirmation), delete (irreversible, gated behind the shared
 * `ConfirmModal`), and a "Predictions" link into
 * `/admin/users/:id/predictions` (`features/admin/predictions/`) for
 * editing that player's standings picks.
 *
 * `pendingActionId` tracks which row has an in-flight ban/unban/role/delete
 * call so its buttons can be disabled without blocking the rest of the
 * table. Ban/role/delete are additionally disabled on the acting admin's
 * own row (`isSelf`) — the API's `AdminUsersController` rejects all three
 * server-side anyway (can't lock yourself out), but surfacing that as a
 * disabled button beats a "could not..." error after the fact.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminUsersService } from '../../admin-users.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { User } from '../../../../../core/auth/user.model';
import { ConfirmModal } from '../../../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-admin-users-page',
  imports: [ReactiveFormsModule, DatePipe, RouterLink, ConfirmModal],
  templateUrl: './admin-users-page.html',
})
export class AdminUsersPage {
  private readonly fb = inject(FormBuilder);
  private readonly adminUsersService = inject(AdminUsersService);
  private readonly authService = inject(AuthService);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly search = signal('');

  protected readonly editingId = signal<string | null>(null);
  protected readonly savingEdit = signal(false);
  protected readonly pendingActionId = signal<string | null>(null);
  protected readonly deleteTarget = signal<User | null>(null);
  protected readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target ? `Permanently delete ${target.pseudo}'s account? This cannot be undone.` : '';
  });
  protected readonly currentUserId = computed(() => this.authService.currentUser()?.id);

  protected readonly form = this.fb.nonNullable.group({
    pseudo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(24)]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.fetch();
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    this.fetch();
  }

  protected startEditing(user: User): void {
    this.errorMessage.set(null);
    this.editingId.set(user.id);
    this.form.setValue({
      pseudo: user.pseudo,
      email: user.email,
    });
  }

  protected cancelEditing(): void {
    this.editingId.set(null);
  }

  protected save(user: User): void {
    if (this.form.invalid || this.savingEdit()) {
      return;
    }
    this.savingEdit.set(true);
    this.errorMessage.set(null);
    const { pseudo, email } = this.form.getRawValue();

    this.adminUsersService.update(user.id, { pseudo, email }).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.savingEdit.set(false);
        this.editingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.savingEdit.set(false);
        this.errorMessage.set(err.status === 409 ? 'That pseudo or email is already taken.' : 'Could not save changes.');
      },
    });
  }

  protected isSelf(user: User): boolean {
    return user.id === this.currentUserId();
  }

  protected toggleRole(user: User): void {
    if (this.pendingActionId() || this.isSelf(user)) {
      return;
    }
    this.pendingActionId.set(user.id);
    this.errorMessage.set(null);
    const nextRole = user.role === 'ADMIN' ? 'PLAYER' : 'ADMIN';

    this.adminUsersService.changeRole(user.id, nextRole).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.pendingActionId.set(null);
      },
      error: () => {
        this.pendingActionId.set(null);
        this.errorMessage.set("Could not update player's role.");
      },
    });
  }

  protected toggleBan(user: User): void {
    if (this.pendingActionId() || this.isSelf(user)) {
      return;
    }
    this.pendingActionId.set(user.id);
    this.errorMessage.set(null);
    const action = user.bannedAt ? this.adminUsersService.unban(user.id) : this.adminUsersService.ban(user.id);

    action.subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.pendingActionId.set(null);
      },
      error: () => {
        this.pendingActionId.set(null);
        this.errorMessage.set('Could not update player status.');
      },
    });
  }

  protected confirmDelete(user: User): void {
    if (this.isSelf(user)) {
      return;
    }
    this.deleteTarget.set(user);
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected deleteConfirmed(): void {
    const user = this.deleteTarget();
    if (!user) {
      return;
    }
    this.pendingActionId.set(user.id);
    this.errorMessage.set(null);

    this.adminUsersService.delete(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== user.id));
        this.pendingActionId.set(null);
        this.deleteTarget.set(null);
      },
      error: () => {
        this.pendingActionId.set(null);
        this.deleteTarget.set(null);
        this.errorMessage.set('Could not delete player.');
      },
    });
  }

  private fetch(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.adminUsersService.list(this.search() || undefined).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load players.');
        this.loading.set(false);
      },
    });
  }
}
