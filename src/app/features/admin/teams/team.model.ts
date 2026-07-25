/**
 * Mirrors the API's `Team` Prisma model as returned by `/admin/teams*`
 * (`AdminTeamsController`). `externalId` is the football-data.org id for
 * synced teams, or a synthetic negative one for admin-created teams — see
 * `AdminTeamsService`'s header comment.
 */
export interface Team {
  id: number;
  externalId: number;
  name: string;
  logoUrl: string | null;
}

export interface CreateTeamPayload {
  name: string;
  logoUrl?: string;
}

export interface UpdateTeamPayload {
  name?: string;
  logoUrl?: string;
  externalId?: number;
}
