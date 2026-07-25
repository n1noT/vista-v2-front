/**
 * Mirrors the API's `SyncResult` type
 * (`vista-v2-api/src/modules/football-sync/types/sync-result.type.ts`) as
 * returned by `POST /admin/sync`.
 */
export interface SyncResult {
  configured: boolean;
  synced: { code: string; competitionName: string }[];
  failed: { code: string; error: string }[];
}
