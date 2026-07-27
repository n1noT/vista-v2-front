/**
 * Mirrors the API's `LeaderboardEntry` type (`GET /leaderboard`,
 * `vista-v2-api/src/modules/leaderboard/types/leaderboard-entry.type.ts`)
 * field-for-field. `rank` uses standard competition ranking (ties share a
 * rank) computed server-side, so the front just renders it as-is.
 */
export interface LeaderboardEntry {
  userId: string;
  pseudo: string;
  avatarUrl: string | null;
  totalPoints: number;
  rank: number;
}
