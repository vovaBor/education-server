import { KeycloakUserInfo } from '../interfaces/keycloak-user.interface';

/**
 * Utilities for working with Keycloak user data
 */
export class KeycloakUserUtil {
  
  /**
   * Extract first name from Keycloak data
   */
  static extractFirstName(userInfo: KeycloakUserInfo): string {
    if (userInfo.given_name) return userInfo.given_name;

    if (userInfo.name) {
      const nameParts = userInfo.name.split(' ');
      return nameParts[0] || 'Unknown';
    }

    // Extract from email (before @)
    const emailPart = userInfo.email.split('@')[0];
    const nameParts = emailPart.split('.');
    return nameParts[0] || 'User';
  }

  /**
   * Extract last name from Keycloak data
   */
  static extractLastName(userInfo: KeycloakUserInfo): string {
    if (userInfo.family_name) return userInfo.family_name;

    if (userInfo.name) {
      const nameParts = userInfo.name.split(' ');
      return nameParts.slice(1).join(' ') || 'User';
    }

    // Extract from email
    const emailPart = userInfo.email.split('@')[0];
    const nameParts = emailPart.split('.');
    return nameParts.slice(1).join('.') || 'User';
  }

  /**
   * Extract primary user role from Keycloak
   * Priority: client roles > realm roles
   */
  static extractPrimaryRole(userInfo: KeycloakUserInfo, clientId = 'education-server'): string {
    // First check client roles
    const clientRoles = userInfo.resource_access?.[clientId]?.roles || [];
    if (clientRoles.length > 0) {
      // Role priority: admin > manager > sales > user
      const rolePriority = ['admin', 'manager', 'sales', 'user'];
      for (const role of rolePriority) {
        if (clientRoles.includes(role)) return role;
      }
      return clientRoles[0]; // First available role
    }

    // Check realm roles
    const realmRoles = userInfo.realm_access?.roles || [];
    const filteredRoles = realmRoles.filter(role =>
      !role.startsWith('default-roles-') &&
      !role.includes('offline_access') &&
      !role.includes('uma_authorization')
    );

    if (filteredRoles.length > 0) {
      const rolePriority = ['admin', 'manager', 'sales'];
      for (const role of rolePriority) {
        if (filteredRoles.includes(role)) return role;
      }
      return filteredRoles[0];
    }

    return 'user'; // Default role
  }

  /**
   * Extract username from Keycloak data
   */
  static extractUsername(userInfo: KeycloakUserInfo): string {
    return userInfo.preferred_username || userInfo.email;
  }

  /**
   * Check email verification status
   */
  static isEmailVerified(userInfo: KeycloakUserInfo): boolean {
    return userInfo.email_verified || false;
  }
} 