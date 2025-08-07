import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ 
  name: 'MonthlyRevenue',
  description: 'Monthly revenue data point for trend analysis'
})
export class MonthlyRevenueDto {
  @ApiProperty({
    description: 'Month start date (first day of month)',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  month: string;

  @ApiProperty({
    description: 'Total revenue for the month (in currency units)',
    example: 45000,
    type: 'number',
    minimum: 0
  })
  revenue: number;

  @ApiProperty({
    description: 'Number of invoices issued in this month',
    example: 12,
    type: 'number',
    minimum: 0
  })
  invoices_count: number;
}

@ApiSchema({ 
  name: 'LeadPipeline',
  description: 'Lead distribution by status for pipeline analysis'
})
export class LeadPipelineDto {
  @ApiProperty({
    description: 'Lead status category',
    example: 'open',
    enum: ['open', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  })
  status: string;

  @ApiProperty({
    description: 'Number of leads in this status',
    example: 25,
    type: 'number',
    minimum: 0
  })
  count: number;

  @ApiProperty({
    description: 'Total estimated value of leads in this status',
    example: 125000,
    type: 'number',
    minimum: 0
  })
  total_value: number;

  @ApiProperty({
    description: 'Average estimated value per lead in this status',
    example: 5000,
    type: 'number',
    minimum: 0
  })
  avg_value: number;
}

@ApiSchema({ 
  name: 'TopClient',
  description: 'Top performing client by revenue'
})
export class TopClientDto {
  @ApiProperty({
    description: 'Client name',
    example: 'Enterprise Corp',
    maxLength: 255
  })
  name: string;

  @ApiProperty({
    description: 'Total revenue from this client (in currency units)',
    example: 250000,
    type: 'number',
    minimum: 0
  })
  revenue: number;

  @ApiProperty({
    description: 'Revenue ranking (1 = highest revenue)',
    example: 1,
    type: 'number',
    minimum: 1,
    maximum: 10
  })
  rank: number;
}

@ApiSchema({ 
  name: 'SummaryStats',
  description: 'Key business metrics summary for dashboard overview'
})
export class SummaryStatsDto {
  @ApiProperty({
    description: 'Total number of clients in the system',
    example: 150,
    type: 'number',
    minimum: 0
  })
  total_clients: number;

  @ApiProperty({
    description: 'Number of clients with active status',
    example: 120,
    type: 'number',
    minimum: 0
  })
  active_clients: number;

  @ApiProperty({
    description: 'Total number of leads in the system',
    example: 45,
    type: 'number',
    minimum: 0
  })
  total_leads: number;

  @ApiProperty({
    description: 'Number of leads with open status',
    example: 25,
    type: 'number',
    minimum: 0
  })
  open_leads: number;

  @ApiProperty({
    description: 'Total number of invoices issued',
    example: 200,
    type: 'number',
    minimum: 0
  })
  total_invoices: number;

  @ApiProperty({
    description: 'Number of invoices that are overdue',
    example: 15,
    type: 'number',
    minimum: 0
  })
  overdue_invoices: number;

  @ApiProperty({
    description: 'Total revenue for the current year (YTD)',
    example: 850000,
    type: 'number',
    minimum: 0
  })
  total_revenue_ytd: number;
}

@ApiSchema({ 
  name: 'PerformanceDashboardResponse',
  description: 'Comprehensive business performance dashboard data combining multiple analytics in a single response'
})
export class PerformanceDashboardResponseDto {
  @ApiProperty({
    description: 'Revenue trends by month for the last 12 months',
    type: [MonthlyRevenueDto],
    isArray: true
  })
  monthly_revenue: MonthlyRevenueDto[];

  @ApiProperty({
    description: 'Lead distribution by status for the last 3 months',
    type: [LeadPipelineDto],
    isArray: true
  })
  lead_pipeline: LeadPipelineDto[];

  @ApiProperty({
    description: 'Top 10 clients by total paid revenue',
    type: [TopClientDto],
    isArray: true
  })
  top_clients: TopClientDto[];

  @ApiProperty({
    description: 'Key business metrics summary',
    type: SummaryStatsDto
  })
  summary_stats: SummaryStatsDto;
} 