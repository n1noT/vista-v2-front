/**
 * Production environment values, swapped in for `environment.ts` by
 * `angular.json`'s `fileReplacements` when building with the `production`
 * configuration (the CLI's default build configuration). `apiUrl` is a
 * placeholder — update it once the API's real production domain (Render/
 * Railway per `vista-v2-docs`) is known; nothing else in the app needs to
 * change since every HTTP call goes through this single `environment.apiUrl`.
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.vista-predi.fr',
};
