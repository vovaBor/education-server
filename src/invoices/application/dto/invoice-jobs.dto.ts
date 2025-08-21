import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber, Min, IsString, IsEmail } from 'class-validator';

/**
 * DTO for scheduling invoice reminder emails
 */
export class ScheduleReminderDto {
  @ApiPropertyOptional({
    description: 'Send immediately or schedule for 3 days before due date',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Immediate must be a boolean value' })
  immediate?: boolean = false;

  @ApiPropertyOptional({
    description: 'Custom delay in hours (overrides immediate flag)',
    example: 72,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Delay hours must be a number' })
  @Min(0, { message: 'Delay hours must be greater than or equal to 0' })
  delayHours?: number;
}

/**
 * DTO for PDF generation requests
 */
export class GeneratePdfDto {
  @ApiProperty({
    description: 'Client ID associated with the invoice',
    example: 10,
  })
  @IsNumber({}, { message: 'Client ID must be a number' })
  clientId: number;

  @ApiPropertyOptional({
    description: 'Email address to send the PDF to',
    example: 'client@company.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Send to email must be a valid email address' })
  sendToEmail?: string;

  @ApiPropertyOptional({
    description: 'Client name for personalized email',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString({ message: 'Client name must be a string' })
  clientName?: string;
} 