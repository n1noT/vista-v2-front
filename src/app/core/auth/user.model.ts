/**
 * Shared auth-related types for the front end. `User` mirrors the API's
 * `AuthenticatedUser` (Prisma's `User` model minus `passwordHash`) — kept as
 * a hand-written interface here rather than generated/shared from the API
 * since the two apps are separate repos with no shared package. `bannedAt`/
 * timestamps are typed as `string` (ISO 8601) since they cross the wire as
 * JSON, not as `Date` instances. `RegisterPayload`/`LoginPayload` are the
 * request bodies `AuthService` sends, matching the API's `RegisterDto`/
 * `LoginDto` field-for-field.
 */
export type Role = 'PLAYER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  pseudo: string;
  avatarUrl: string | null;
  role: Role;
  bannedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  pseudo: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
