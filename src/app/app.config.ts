/**
 * Root application providers, assembled with Angular's standalone
 * `ApplicationConfig` (no NgModules in this project).
 *
 * - `provideRouter(routes)` wires the top-level route table.
 * - `provideClientHydration(withEventReplay())` makes SSR-rendered pages
 *   hydrate on the client instead of re-rendering from scratch, and replays
 *   any user events (e.g. a click) that happened before hydration finished.
 * - `provideHttpClient(withFetch(), withInterceptors([credentialsInterceptor]))`
 *   uses the fetch-based HTTP backend (works natively with Node's fetch
 *   during SSR, avoiding the xhr2 polyfill the default XHR backend needs
 *   server-side) and registers `credentialsInterceptor` globally so every
 *   component that injects `HttpClient` automatically sends the auth cookie
 *   to the API without remembering `withCredentials: true` per call.
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { credentialsInterceptor } from './core/http/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([credentialsInterceptor])),
  ]
};
