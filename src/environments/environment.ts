/**
 * Default environment config, used by `ng serve` and any build that doesn't
 * target the `production` configuration. `apiUrl` points at the NestJS API
 * running locally (either bare `npm run start:dev` or the `api` service in
 * `vista-v2-infra`'s docker-compose, both published on host port 3000).
 * Swapped for `environment.prod.ts` on production builds via `angular.json`'s
 * `fileReplacements` — see the `production` configuration's `build` target.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
