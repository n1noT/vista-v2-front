/**
 * Shared potential-points math for the standings predictor, used by both
 * `DraggableLeagueTable` (per-row badge) and `ChampionshipPredictionPage`
 * (header running total) — factored out once a second consumer needed it
 * rather than duplicated. Mirrors `vista-v2-api`'s
 * `admin/results/scoring.util.ts::calculateItemPoints` but fixes `C = 50`
 * (best case) since the real result `R` isn't known at prediction time —
 * only the risk coefficient `M`, built from the gap between the guessed
 * position and the team's bookmaker-expected position, varies here.
 */
export interface PlacementPreview {
  points: number;
  riskClass: string;
}

export function placementPreview(
  expectedPosition: number | null,
  guessedPosition: number,
  teamCount: number,
): PlacementPreview | null {
  if (expectedPosition === null || teamCount <= 1) {
    return null;
  }
  const ratio = Math.abs(expectedPosition - guessedPosition) / (teamCount - 1);
  const points = Math.round((1 + 4 * ratio) * 50);
  const riskClass = ratio < 1 / 3 ? 'bg-risk-low' : ratio < 2 / 3 ? 'bg-risk-mid' : 'bg-risk-high';
  return { points, riskClass };
}
