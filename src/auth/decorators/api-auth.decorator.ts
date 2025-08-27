import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';
import { Public } from 'nest-keycloak-connect';
import { LoginDto } from '../dto/login.dto';

/**
 * Decorator for public login API
 */
export const ApiPublicLogin = (summary = 'Get access token') =>
  applyDecorators(
    Public(),
    ApiOperation({ summary }),
    ApiBody({ type: LoginDto }),
    ApiOkResponse({ description: 'Token successfully obtained' }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
  );

/**
 * Decorator for protected profile API
 */
export const ApiAuthProfile = (summary = 'Get user profile') =>
  applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({ description: 'User profile retrieved' }),
    ApiUnauthorizedResponse({ description: 'Authentication required' }),
  ); 
