import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KeycloakUserInfo } from '../interfaces/keycloak-user.interface';
import { KeycloakUserUtil } from '../utils/keycloak-user.util';

@Injectable()
export class JitSyncService {
  private readonly logger = new Logger(JitSyncService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * JIT (Just-in-Time) user synchronization from Keycloak token
   * Creates or updates user on every request
   */
  async syncUserFromKeycloak(keycloakUserInfo: KeycloakUserInfo): Promise<User> {
    const keycloakId = keycloakUserInfo.sub;

    this.logger.debug(`🔄 JIT sync for user: ${keycloakUserInfo.email} (${keycloakId})`);

    try {
      // Find existing user
      let user = await this.findExistingUser(keycloakId, keycloakUserInfo.email);

      if (!user) {
        // Create new user
        user = this.createNewUser(keycloakUserInfo);
        this.logger.log(`➕ Creating new user from Keycloak: ${keycloakUserInfo.email}`);
      } else {
        // Update existing user
        const hasChanges = this.updateExistingUser(user, keycloakUserInfo);
        if (hasChanges) {
          this.logger.debug(`🔄 Updating user data: ${keycloakUserInfo.email}`);
        }
      }

      // Update last sync time
      user.lastSyncAt = new Date();

      // Save user
      const savedUser = await this.userRepository.save(user);

      this.logger.debug(`✅ JIT sync completed for user: ${savedUser.email} (ID: ${savedUser.id})`);

      return savedUser;

    } catch (error) {
      this.logger.error(`❌ JIT sync error for user ${keycloakUserInfo.email}:`, error);
      throw error;
    }
  }

  /**
   * Get user by keycloakId
   */
  async findUserByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { keycloakId }
    });
  }

  /**
   * Find existing user by keycloakId or email
   */
  private async findExistingUser(keycloakId: string, email: string): Promise<User | null> {
    // First search by keycloakId
    let user = await this.userRepository.findOne({
      where: { keycloakId }
    });

    if (!user) {
      // Search by email (for migrating existing users)
      user = await this.userRepository.findOne({
        where: { email }
      });

      if (user) {
        this.logger.log(`📧 Found user by email, linking to Keycloak: ${email}`);
        // Link to Keycloak
        user.keycloakId = keycloakId;
      }
    }

    return user;
  }

  /**
   * Create new user from Keycloak data
   */
  private createNewUser(keycloakUserInfo: KeycloakUserInfo): User {
    return this.userRepository.create({
      keycloakId: keycloakUserInfo.sub,
      email: keycloakUserInfo.email,
      username: KeycloakUserUtil.extractUsername(keycloakUserInfo),
      firstName: KeycloakUserUtil.extractFirstName(keycloakUserInfo),
      lastName: KeycloakUserUtil.extractLastName(keycloakUserInfo),
      emailVerified: KeycloakUserUtil.isEmailVerified(keycloakUserInfo),
      role: KeycloakUserUtil.extractPrimaryRole(keycloakUserInfo),
      isActive: true,
    });
  }

  /**
   * Update existing user with Keycloak data
   * Returns true if there were changes
   */
  private updateExistingUser(user: User, keycloakUserInfo: KeycloakUserInfo): boolean {
    let hasChanges = false;

    // Create object with new data
    const newData = {
      email: keycloakUserInfo.email,
      username: KeycloakUserUtil.extractUsername(keycloakUserInfo),
      firstName: KeycloakUserUtil.extractFirstName(keycloakUserInfo),
      lastName: KeycloakUserUtil.extractLastName(keycloakUserInfo),
      emailVerified: KeycloakUserUtil.isEmailVerified(keycloakUserInfo),
      role: KeycloakUserUtil.extractPrimaryRole(keycloakUserInfo),
    };

    // Check and update only changed fields
    for (const [key, newValue] of Object.entries(newData)) {
      if (user[key] !== newValue) {
        user[key] = newValue;
        hasChanges = true;
      }
    }

    return hasChanges;
  }
} 