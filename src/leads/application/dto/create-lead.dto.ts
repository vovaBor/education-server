import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';
import { LeadPriority } from '../../domain/types/lead.types';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Lead title or name',
    example: 'Enterprise Software Inquiry',
    maxLength: 255
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the lead',
    example: 'Potential client interested in our enterprise software solution for inventory management',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Lead priority level',
    enum: LeadPriority,
    example: LeadPriority.MEDIUM,
    default: LeadPriority.MEDIUM,
    required: false
  })
  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @ApiProperty({
    description: 'Estimated deal value in dollars',
    example: 50000,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiProperty({
    description: 'Expected close date in ISO format',
    example: '2024-12-31T00:00:00.000Z',
    format: 'date-time',
    required: false
  })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiProperty({
    description: 'ID of the associated client',
    example: 123,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  clientId?: number;
} 