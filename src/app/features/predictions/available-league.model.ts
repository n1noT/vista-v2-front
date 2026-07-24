/**
 * Mirrors the API's `LeagueWithPredictionStatus` type (`GET /predictions/leagues`,
 * `vista-v2-api/src/modules/predictions/types/league-with-prediction-status.type.ts`)
 * field-for-field — one entry per league with `TeamLeagueSeason` data for
 * the current season, i.e. a championship the hub can link a player into,
 * plus the current user's progress on it so the hub can render "submitted"
 * without a separate round-trip per league.
 */
export type PredictionProgress = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED';

export interface AvailableLeague {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  teamCount: number;
  predictionStatus: PredictionProgress;
}
