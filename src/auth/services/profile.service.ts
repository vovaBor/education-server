import { Injectable } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ProfileService {
  
  formatProfileResponse(user: User | null) {
    if (!user) {
      return {
        message: 'User not synchronized',
        error: 'User not found in local database',
      };
    }

    const lastSync = user.lastSyncAt || user.updatedAt;
    const secondsAgo = Math.floor((Date.now() - lastSync.getTime()) / 1000);
    
    return {
      message: 'Synchronized user profile',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastSyncAgo: secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`,
      }
    };
  }
} 