/**
 * Mirrors the API's `LeagueDetail` type (`GET /leagues/:leagueId`,
 * `vista-v2-api/src/modules/leagues/types/league-detail.type.ts`)
 * field-for-field — the full team list for a league's current season, used
 * to seed the `DraggableLeagueTable` on `/predictions/league/[id]`.
 * `teams` arrives sorted by real current position; that's just a sane
 * default drag-and-drop order, not a hint the UI should otherwise surface.
 */
export interface LeagueTeamStanding {
  teamId: number;
  name: string;
  logoUrl: string | null;
  position: number;
}

export interface LeagueDetail {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  seasonStartDate: string;
  teams: LeagueTeamStanding[];
}
