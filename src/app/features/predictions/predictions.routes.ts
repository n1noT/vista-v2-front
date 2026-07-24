/**
 * Route table for the predictions feature: the `/predictions` hub plus
 * `/predictions/league/:id` (the domestic-championship standings
 * form). Both guarded by `authGuard` like `/profile`. The Champions League
 * pages it links to (`/predictions/ldc/phase-ligue`,
 * `/predictions/ldc/phase-finale` — see
 * `vista-v2-docs/02_Frontend_UI/Arborescence_Pages.md`) aren't built yet.
 */
import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const predictionsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/predictions-hub/predictions-hub').then((m) => m.PredictionsHub),
  },
  {
    path: 'league/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/championship-prediction-page/championship-prediction-page').then((m) => m.ChampionshipPredictionPage),
  },
];
