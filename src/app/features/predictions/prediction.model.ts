/**
 * Mirrors the API's `Prediction`/`PredictionItem` Prisma models as returned
 * by `GET /predictions` and `POST /predictions/draft|submit`
 * (`vista-v2-api/src/modules/predictions/`). `PredictionState` matches the
 * Prisma enum of the same name. `CUPredictionsPayload` mirrors
 * `CUPredictionsDto` field-for-field — the body both write endpoints expect.
 */
export type PredictionState = 'DRAFT' | 'SUBMITTED';

export interface PredictionItem {
  id: number;
  predictionId: number;
  teamId: number;
  position: number;
}

export interface Prediction {
  id: number;
  userId: string;
  leagueId: number;
  seasonId: number;
  status: PredictionState;
  submittedAt: string | null;
  items: PredictionItem[];
}

export interface CUPredictionsPayload {
  leagueId: number;
  seasonId: number;
  predictions: Array<{ teamId: number; position: number }>;
}
