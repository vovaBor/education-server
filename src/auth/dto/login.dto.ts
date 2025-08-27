import { IsString, MinLength } from 'class-validator';

/**
 * DTO for user authentication
 */
export class LoginDto {
  @IsString()
  username: string;
  @IsString()
  @MinLength(3)
  password: string;
}

/**
 * Access token response
 */
export class TokenResponseDto {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in?: number;
  scope?: string;
  session_state?: string;
}

/**
 * Authentication error
 */
export class TokenErrorDto {
  error: string;
  error_description: string;
} 
