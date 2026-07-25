/**
 * Mirrors the API's `League` Prisma model as returned by `/admin/leagues*`
 * (`AdminLeaguesController`). `externalId` is the football-data.org id for
 * synced leagues, or a synthetic negative one for admin-created ones — see
 * `AdminLeaguesService`'s header comment.
 */
export interface League {
  id: number;
  externalId: number;
  name: string;
  logoUrl: string | null;
}

export interface CreateLeaguePayload {
  name: string;
  logoUrl?: string;
}

export interface UpdateLeaguePayload {
  name?: string;
  logoUrl?: string;
  externalId?: number;
}
