import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { LeadStatus } from '../../domain/types/lead.types';

export class UpdateLeadStatusDto {
  @ApiProperty({
    description: 'New status for the lead',
    enum: LeadStatus,
    example: LeadStatus.CONTACTED
  })
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @ApiProperty({
    description: 'ID of the user making the status change',
    example: 123,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  changedBy?: number;
} 