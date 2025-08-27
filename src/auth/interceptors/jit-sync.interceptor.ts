import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JitSyncService } from '../services/jit-sync.service';
import { KeycloakUserInfo } from '../interfaces/keycloak-user.interface';

/**
 * Interceptor for JIT (Just-in-Time) user synchronization with Keycloak
 * Automatically creates or updates users on every authenticated request
 */
@Injectable()
export class JitSyncInterceptor implements NestInterceptor {
  private readonly logger = new Logger(JitSyncInterceptor.name);

  constructor(private readonly jitSyncService: JitSyncService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Get user data from token (set by nest-keycloak-connect)
    const keycloakUser: KeycloakUserInfo = request.user;

    if (this.isValidKeycloakUser(keycloakUser)) {
      try {
        // Perform JIT synchronization
        const syncedUser = await this.jitSyncService.syncUserFromKeycloak(keycloakUser);

        // Add synchronized user to request for use in controllers
        request.localUser = syncedUser;

        this.logger.debug(`🔄 JIT sync completed for ${syncedUser.email}`);

      } catch (error) {
        // Log error but don't interrupt request execution
        this.logger.error(`❌ JIT sync error for user ${keycloakUser.email}:`, error);

        // In case of error, try to find existing user
        await this.handleSyncError(keycloakUser, request);
      }
    } else {
      this.logger.debug(`⚠️ No user data in token or unauthenticated request`);
    }

    return next.handle();
  }

  /**
   * Validates Keycloak user data
   */
  private isValidKeycloakUser(keycloakUser: any): keycloakUser is KeycloakUserInfo {
    return keycloakUser && 
           typeof keycloakUser.sub === 'string' && 
           typeof keycloakUser.email === 'string' &&
           keycloakUser.sub.length > 0 &&
           keycloakUser.email.includes('@');
  }

  /**
   * Handles synchronization error
   */
  private async handleSyncError(keycloakUser: KeycloakUserInfo, request: any): Promise<void> {
    try {
      const existingUser = await this.jitSyncService.findUserByKeycloakId(keycloakUser.sub);
      if (existingUser) {
        request.localUser = existingUser;
        this.logger.debug(`🔍 Using existing user ${existingUser.email}`);
      }
    } catch (fallbackError) {
      this.logger.error(`❌ Error finding existing user:`, fallbackError);
    }
  }
} 