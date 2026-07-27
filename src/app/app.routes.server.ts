import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Dynamic per-league, authenticated page — there's no fixed set of `:id`s
  // to prerender (and it's guarded/per-user besides), so it renders
  // client-side rather than needing a `getPrerenderParams` enumeration.
  {
    path: 'predictions/league/:id',
    renderMode: RenderMode.Client
  },
  // Same reasoning — no fixed set of player `:id`s to prerender.
  {
    path: 'profile/:id',
    renderMode: RenderMode.Client
  },
  // Same reasoning as above, for the admin per-player prediction routes —
  // no fixed set of `:userId`/`:leagueId`s to prerender.
  {
    path: 'admin/users/:userId/predictions',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/users/:userId/predictions/league/:leagueId',
    renderMode: RenderMode.Client
  },
  // Same reasoning — no fixed set of `:id`s to prerender.
  {
    path: 'admin/seasons/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
