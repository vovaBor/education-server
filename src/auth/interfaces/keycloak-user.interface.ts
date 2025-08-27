/**
 * Interface for Keycloak user information from JWT token
 * Based on OpenID Connect standard fields and Keycloak-specific fields
 */
export interface KeycloakUserInfo {
  // Standard JWT fields
  sub: string; // Keycloak User ID
  email: string;
  email_verified?: boolean;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;

  // Keycloak roles
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };

  // Additional fields
  iss?: string; // Issuer
  aud?: string | string[]; // Audience
  iat?: number; // Issued At
  exp?: number; // Expires At
  azp?: string; // Authorized Party (Client ID)
  session_state?: string;
  scope?: string;
} 