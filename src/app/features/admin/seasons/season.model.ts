/**
 * Mirrors the API's `Season`/`TeamLeagueSeason` shapes as returned by
 * `/admin/seasons*` (`AdminSeasonsController`). `externalId` is the
 * football-data.org id for synced seasons, or a synthetic negative one for
 * admin-created ones — see `AdminSeasonsService`'s header comment. Every
 * season belongs to exactly one league (`leagueId`/`league`, required at
 * create) — matching how football-data.org's own season ids are already
 * scoped to one competition. `Participation` is a `TeamLeagueSeason` row
 * with its `team` included, as returned by `GET /admin/seasons/:id` and the
 * add/update-participation endpoints — it has no `league` of its own since
 * that's implied by the season it belongs to.
 */
export interface Season {
  id: number;
  externalId: number;
  leagueId: number;
  league: { id: number; name: string; logoUrl: string | null };
  startDate: string;
  endDate: string;
  currentMatchday: number;
  isCurrent: boolean;
}

export interface Participation {
  id: number;
  teamId: number;
  seasonId: number;
  position: number;
  playedGames: number;
  team: { id: number; name: string; logoUrl: string | null };
}

export interface SeasonDetail extends Season {
  participations: Participation[];
}

export interface CreateSeasonPayload {
  leagueId: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
  isCurrent?: boolean;
}

export interface UpdateSeasonPayload {
  leagueId?: number;
  startDate?: string;
  endDate?: string;
  currentMatchday?: number;
  isCurrent?: boolean;
  externalId?: number;
}

export interface AddTeamToSeasonPayload {
  teamId: number;
  position: number;
  playedGames: number;
}

export interface UpdateParticipationPayload {
  position?: number;
  playedGames?: number;
}
