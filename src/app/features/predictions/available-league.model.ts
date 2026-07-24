/**
 * Mirrors the API's `AvailableLeague` type (`GET /leagues`,
 * `vista-v2-api/src/modules/leagues/types/available-league.type.ts`)
 * field-for-field — one entry per league with `TeamLeagueSeason` data for
 * the current season, i.e. a championship the hub can link a player into.
 */
export interface AvailableLeague {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  teamCount: number;
}
