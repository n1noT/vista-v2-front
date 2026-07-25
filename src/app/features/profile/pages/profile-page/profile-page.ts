/**
 * `/profile` page (guarded — see `profile.routes.ts`). Reads the current
 * user straight from `AuthService.currentUser` rather than fetching its own
 * copy, since `authGuard` already resolved the session before this component
 * loads. The `effect()` in the constructor keeps the edit form's `pseudo`
 * field in sync whenever `currentUser` changes (including right after a
 * successful save, so re-opening the editor shows the new value). Only
 * `pseudo` is editable for now — avatar upload is deferred (see
 * `UsersController`'s comment on why). `logout()` clears the session and
 * sends the user back to `/login`. An "Admin dashboard" link to `/admin`
 * shows only for `role === 'ADMIN'` — purely a UX convenience, not a
 * security boundary; the API's `RolesGuard` is what actually enforces it
 * (see `AdminUsersController`/`AdminDashboardController`).
 */
import { Component, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProfileService } from '../../profile.service';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    pseudo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(24)]],
  });

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.form.patchValue({ pseudo: user.pseudo });
      }
    });
  }

  protected startEditing(): void {
    this.errorMessage.set(null);
    this.editing.set(true);
  }

  protected cancelEditing(): void {
    const user = this.currentUser();
    if (user) {
      this.form.patchValue({ pseudo: user.pseudo });
    }
    this.editing.set(false);
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);

    this.profileService.updatePseudo(this.form.getRawValue().pseudo).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(err.status === 409 ? 'That pseudo is already taken.' : 'Could not save changes.');
      },
    });
  }

  protected logout(): void {
    this.authService.logout().subscribe(() => void this.router.navigateByUrl('/login'));
  }
}
