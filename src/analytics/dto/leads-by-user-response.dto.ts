import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ 
  name: 'LeadsByUserResponse',
  description: 'Lead performance statistics for a single user including workload and efficiency metrics'
})
export class LeadsByUserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 1,
    type: 'number'
  })
  user_id: number;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    maxLength: 100
  })
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    maxLength: 100
  })
  last_name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@company.com',
    format: 'email',
    maxLength: 255
  })
  user_email: string;

  @ApiProperty({
    description: 'Total number of leads assigned to this user',
    example: '12',
    type: 'string'
  })
  total_leads: string;

  @ApiProperty({
    description: 'Number of leads in open status',
    example: '5',
    type: 'string'
  })
  open_leads: string;

  @ApiProperty({
    description: 'Number of high priority leads requiring attention',
    example: '2',
    type: 'string'
  })
  high_priority_leads: string;

  @ApiProperty({
    description: 'Number of urgent leads requiring immediate action',
    example: '1',
    type: 'string'
  })
  urgent_leads: string;

  @ApiProperty({
    description: 'Total estimated value of all leads (in currency units)',
    example: '150000.00',
    type: 'string',
    pattern: '^\\d+\\.\\d{2}$'
  })
  total_estimated_value: string;

  @ApiProperty({
    description: 'Average estimated value per lead',
    example: '12500.000000000000',
    type: 'string'
  })
  avg_lead_value: string;

  @ApiProperty({
    description: 'Number of leads past their expected close date',
    example: '1',
    type: 'string'
  })
  overdue_leads: string;

  @ApiProperty({
    description: 'Date of the oldest lead assigned to this user',
    example: '2024-03-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  oldest_lead_date: string;

  @ApiProperty({
    description: 'Date of the most recently assigned lead',
    example: '2024-06-20T14:15:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  newest_lead_date: string;
} 