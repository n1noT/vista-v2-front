import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Dynamic per-league, authenticated page — there's no fixed set of `:id`s
  // to prerender (and it's guarded/per-user besides), so it renders
  // client-side rather than needing a `getPrerenderParams` enumeration.
  {
    path: 'predictions/league/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
