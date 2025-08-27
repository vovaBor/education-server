import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthTokenService } from './auth-token.service';
import { ProfileService } from './services/profile.service';
import { JitSyncService } from './services/jit-sync.service';
import { JitSyncInterceptor } from './interceptors/jit-sync.interceptor';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthTokenService,
    ProfileService,
    JitSyncService,
    JitSyncInterceptor,
  ],
  exports: [
    AuthTokenService,
    ProfileService,
    JitSyncService,
    JitSyncInterceptor,
  ],
})
export class AuthModule {} 
