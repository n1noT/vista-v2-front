/**
 * Mirrors the API's `Season`/`TeamLeagueSeason` shapes as returned by
 * `/admin/seasons*` (`AdminSeasonsController`). `externalId` is the
 * football-data.org id for synced seasons, or a synthetic negative one for
 * admin-created ones — see `AdminSeasonsService`'s header comment.
 * `Participation` is a `TeamLeagueSeason` row with its `team`/`league`
 * included, as returned by `GET /admin/seasons/:id` and the
 * add/update-participation endpoints.
 */
export interface Season {
  id: number;
  externalId: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
  isCurrent: boolean;
}

export interface Participation {
  id: number;
  teamId: number;
  leagueId: number;
  seasonId: number;
  position: number;
  playedGames: number;
  team: { id: number; name: string; logoUrl: string | null };
  league: { id: number; name: string; logoUrl: string | null };
}

export interface SeasonDetail extends Season {
  participations: Participation[];
}

export interface CreateSeasonPayload {
  startDate: string;
  endDate: string;
  currentMatchday: number;
  isCurrent?: boolean;
}

export interface UpdateSeasonPayload {
  startDate?: string;
  endDate?: string;
  currentMatchday?: number;
  isCurrent?: boolean;
  externalId?: number;
}

export interface AddTeamToSeasonPayload {
  teamId: number;
  leagueId: number;
  position: number;
  playedGames: number;
}

export interface UpdateParticipationPayload {
  position?: number;
  playedGames?: number;
}
