import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto, TokenResponseDto } from './dto/login.dto';

@Injectable()
export class AuthTokenService {
  private readonly logger = new Logger(AuthTokenService.name);
  
  constructor(private configService: ConfigService) {}

  async getToken(loginDto: LoginDto): Promise<TokenResponseDto> {
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://localhost:8080';
    const realm = this.configService.get<string>('KEYCLOAK_REALM') || 'education-realm';
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID') || 'education-server';
    const clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET');

    if (!clientSecret) {
      throw new HttpException(
        {
          error: 'configuration_error',
          error_description: 'Client secret not configured. Set KEYCLOAK_CLIENT_SECRET environment variable.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret,
      username: loginDto.username,
      password: loginDto.password,
    });

    this.logger.log(`Requesting token for user: ${loginDto.username}`);
    this.logger.debug(`Token URL: ${tokenUrl}`);
    this.logger.debug(`Client ID: ${clientId}`);

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.warn(`Token request failed for user ${loginDto.username}: ${data.error_description || data.error}`);
        
        let statusCode = HttpStatus.BAD_REQUEST;
        
        if (data.error === 'invalid_grant' || data.error === 'unauthorized') {
          statusCode = HttpStatus.UNAUTHORIZED;
        } else if (data.error === 'invalid_client') {
          statusCode = HttpStatus.UNAUTHORIZED;
        } else if (data.error === 'unsupported_grant_type') {
          statusCode = HttpStatus.BAD_REQUEST;
        }

        throw new HttpException(
          {
            error: data.error || 'token_request_failed',
            error_description: data.error_description || 'Failed to obtain token',
          },
          statusCode,
        );
      }

      this.logger.log(`Token successfully obtained for user: ${loginDto.username}`);
      this.logger.debug(`Token expires in: ${data.expires_in} seconds`);

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in,
        refresh_expires_in: data.refresh_expires_in,
        scope: data.scope,
        session_state: data.session_state,
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Network error while requesting token for user ${loginDto.username}:`, error.message);
      
      throw new HttpException(
        {
          error: 'network_error',
          error_description: `Failed to connect to Keycloak: ${error.message}`,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }


} 
