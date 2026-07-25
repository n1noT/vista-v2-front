/**
 * Mirrors the API's `GET /admin/dashboard` response shape
 * (`AdminDashboardController.getOverview`) — `players` from
 * `UsersService.countPlayers()`, `championships` from
 * `LeaguesService.getChampionshipStatuses()`. Dates cross the wire as ISO
 * strings, same convention as `core/auth/user.model.ts`.
 */
export interface PlayerCounts {
  total: number;
  banned: number;
}

export interface ChampionshipStatus {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  currentMatchday: number;
  startDate: string;
  endDate: string;
  teamCount: number;
}

export interface DashboardOverview {
  players: PlayerCounts;
  championships: ChampionshipStatus[];
}
