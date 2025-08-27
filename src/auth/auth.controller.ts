import { Controller, Get, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'nest-keycloak-connect';

import { AuthTokenService } from './auth-token.service';
import { ProfileService } from './services/profile.service';
import { LoginDto } from './dto/login.dto';
import { LocalUser } from './decorators/local-user.decorator';
import { ApiPublicLogin, ApiAuthProfile } from './decorators/api-auth.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly profileService: ProfileService,
  ) {}

  @Post('login')
  @Public()
  @ApiPublicLogin()
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authTokenService.getToken(loginDto);
  }

  @Get('profile')
  @ApiAuthProfile()
  getProfile(@LocalUser() user: User) {
    return this.profileService.formatProfileResponse(user);
  }
} 
