/**
 * Mirrors the API's `PublicProfile` (`GET /users/:id`,
 * `vista-v2-api/src/modules/users/types/public-profile.type.ts`) and
 * `PublicLeaguePrediction` (`GET /predictions/users/:userId`,
 * `vista-v2-api/src/modules/predictions/types/public-league-prediction.type.ts`)
 * field-for-field. `items`/`totalPoints` on `PublicLeaguePrediction` are only
 * non-null when `visible` is true — both the profile owner and the viewer
 * must have `SUBMITTED` their own prediction for that league, per
 * `Fonctionnalites_Joueurs.md`.
 */
export interface PublicProfile {
  id: string;
  pseudo: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface PublicPredictionTeam {
  teamId: number;
  name: string;
  logoUrl: string | null;
  position: number;
  points: number | null;
}

export interface PublicLeaguePrediction {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  targetSubmitted: boolean;
  viewerSubmitted: boolean;
  visible: boolean;
  totalPoints: number | null;
  items: PublicPredictionTeam[] | null;
}
