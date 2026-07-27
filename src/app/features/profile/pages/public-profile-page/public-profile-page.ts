/**
 * `/profile/:id` (guarded by `authGuard` — see `profile.routes.ts`). The
 * read-only counterpart to `ProfilePage`: shows another player's pseudo,
 * avatar, and join date, plus their per-league standings prediction gated by
 * `Fonctionnalites_Joueurs.md`'s mutual-submission rule ("le joueur peut
 * consulter les prédictions des autres joueurs s'il a prédit ce championnat
 * ... définitivement"). `PublicLeaguePrediction.visible` is computed
 * server-side from *both* the viewer's and the profile owner's submission
 * status (`PredictionsService.getPublicPredictions`) — this page only
 * renders whatever comes back, it does no visibility logic of its own.
 *
 * Renders the same read-only view even when `:id` is the logged-in user's
 * own id — deliberately no self-redirect to `/profile` here, so every
 * `/profile/:id` link (e.g. the leaderboard's, which links every row
 * including the viewer's own the same way) behaves uniformly regardless of
 * whose id it is. `/profile` (editable, with the pseudo-change form) stays a
 * separate page reached via its own nav link, not implied by this one.
 * Reactive on `route.paramMap` (not just the initial snapshot), same
 * reasoning as `ChampionshipPredictionPage`: Angular's default
 * `RouteReuseStrategy` reuses this component instance across
 * `/profile/a` → `/profile/b` navigations.
 */
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfileService } from '../../profile.service';
import { PublicLeaguePrediction, PublicProfile } from '../../public-profile.model';

@Component({
  selector: 'app-public-profile-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './public-profile-page.html',
})
export class PublicProfilePage {
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);

  protected readonly profile = signal<PublicProfile | null>(null);
  protected readonly leagues = signal<PublicLeaguePrediction[] | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.load(params.get('id')!);
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.profile.set(null);
    this.leagues.set(null);

    forkJoin({
      profile: this.profileService.getPublicProfile(id),
      leagues: this.profileService.getPublicPredictions(id),
    }).subscribe({
      next: ({ profile, leagues }) => {
        this.profile.set(profile);
        this.leagues.set(leagues);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(err.status === 404 ? 'This player could not be found.' : 'Could not load this profile.');
      },
    });
  }
}
