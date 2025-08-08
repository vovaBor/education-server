import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus, LeadPriority } from '../../domain/types/lead.types';

export class LeadResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the lead',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Lead title or name',
    example: 'Enterprise Software Inquiry'
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the lead',
    example: 'Potential client interested in our enterprise software solution for inventory management',
    nullable: true
  })
  description: string | null;

  @ApiProperty({
    description: 'Current status of the lead',
    enum: LeadStatus,
    example: LeadStatus.OPEN
  })
  status: LeadStatus;

  @ApiProperty({
    description: 'Priority level of the lead',
    enum: LeadPriority,
    example: LeadPriority.MEDIUM
  })
  priority: LeadPriority;

  @ApiProperty({
    description: 'Estimated deal value in dollars',
    example: 50000,
    nullable: true
  })
  estimatedValue: number | null;

  @ApiProperty({
    description: 'Expected close date',
    example: '2024-12-31T00:00:00.000Z',
    format: 'date-time',
    nullable: true
  })
  expectedCloseDate: Date | null;

  @ApiProperty({
    description: 'ID of the assigned user',
    example: 456,
    nullable: true
  })
  assignedUserId: number | null;

  @ApiProperty({
    description: 'ID of the associated client',
    example: 123,
    nullable: true
  })
  clientId: number | null;

  @ApiProperty({
    description: 'Date when the lead was created',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the lead was last updated',
    example: '2024-01-16T14:45:00.000Z',
    format: 'date-time'
  })
  updatedAt: Date;
}

export class LeadListResponseDto {
  @ApiProperty({
    description: 'Array of leads',
    type: [LeadResponseDto]
  })
  data: LeadResponseDto[];
}

export class LeadSingleResponseDto {
  @ApiProperty({
    description: 'Lead data',
    type: LeadResponseDto
  })
  data: LeadResponseDto;
}

export class LeadOperationResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Operation result message',
    example: 'Lead assigned successfully'
  })
  message: string;

  @ApiProperty({
    description: 'ID of the affected lead',
    example: 1,
    required: false
  })
  leadId?: number;
} 