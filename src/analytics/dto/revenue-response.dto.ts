import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ 
  name: 'RevenueByClientResponse',
  description: 'Comprehensive revenue statistics for a single client including financial metrics and lead conversion data'
})
export class RevenueByClientResponseDto {
  @ApiProperty({
    description: 'Unique client identifier',
    example: 1,
    type: 'number'
  })
  client_id: number;

  @ApiProperty({
    description: 'Client company or individual name',
    example: 'Acme Corporation',
    maxLength: 255
  })
  client_name: string;

  @ApiProperty({
    description: 'Primary client email address',
    example: 'contact@acme.com',
    format: 'email',
    maxLength: 255
  })
  client_email: string;

  @ApiProperty({
    description: 'Current client status in the CRM system',
    example: 'active',
    enum: ['prospect', 'active', 'inactive', 'archived']
  })
  client_status: string;

  @ApiProperty({
    description: 'Total number of invoices issued to this client',
    example: '5',
    type: 'string'
  })
  total_invoices: string;

  @ApiProperty({
    description: 'Number of fully paid invoices',
    example: '3',
    type: 'string'
  })
  paid_invoices: string;

  @ApiProperty({
    description: 'Number of overdue invoices requiring attention',
    example: '1',
    type: 'string'
  })
  overdue_invoices: string;

  @ApiProperty({
    description: 'Total revenue received from paid invoices (in currency units)',
    example: '125000.00',
    type: 'string',
    pattern: '^\\d+\\.\\d{2}$'
  })
  total_paid_revenue: string;

  @ApiProperty({
    description: 'Outstanding amount from unpaid invoices (in currency units)',
    example: '25000.00',
    type: 'string',
    pattern: '^\\d+\\.\\d{2}$'
  })
  outstanding_revenue: string;

  @ApiProperty({
    description: 'Total amount across all invoices for this client',
    example: '150000.00',
    type: 'string',
    pattern: '^\\d+\\.\\d{2}$'
  })
  total_invoiced: string;

  @ApiProperty({
    description: 'Average value per paid invoice',
    example: '30000.000000000000',
    type: 'string'
  })
  avg_invoice_value: string;

  @ApiProperty({
    description: 'Total payments received (including partial payments)',
    example: '125000.00',
    type: 'string',
    pattern: '^\\d+\\.\\d{2}$'
  })
  total_payments_received: string;

  @ApiProperty({
    description: 'Date of the first invoice issued to this client',
    example: '2024-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  first_invoice_date: string;

  @ApiProperty({
    description: 'Date of the most recent invoice issued to this client',
    example: '2024-06-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  last_invoice_date: string;

  @ApiProperty({
    description: 'Total number of leads associated with this client',
    example: '8',
    type: 'string'
  })
  total_leads: string;

  @ApiProperty({
    description: 'Number of leads that resulted in successful deals',
    example: '2',
    type: 'string'
  })
  won_leads: string;

  @ApiProperty({
    description: 'Percentage of leads converted to won deals (0-100)',
    example: '25.00',
    type: 'string',
    minimum: 0,
    maximum: 100
  })
  lead_conversion_rate: string;
} 