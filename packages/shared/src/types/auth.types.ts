/**
 * User Roles recognized across SAATHI
 */
export type UserRole = 'LEARNER' | 'PARENT' | 'COUNSELLOR' | 'ADMINISTRATOR';

/**
 * Supported UI Languages
 */
export type SupportedLanguage = 'en' | 'hi';

/**
 * Public User profile
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  language: SupportedLanguage;
  isMinor: boolean;
  parentConsentGiven: boolean;
  householdId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication Response Payload
 */
export interface AuthResult {
  user: UserProfile;
  accessToken: string;
}

/**
 * Decoded JWT access payload
 */
export interface JwtAccessPayload {
  userId: string;
  role: UserRole;
  email: string;
}
