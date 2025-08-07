import { Controller, Get, Query, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RevenueByClientResponseDto } from './dto/revenue-response.dto';
import { LeadsByUserResponseDto } from './dto/leads-by-user-response.dto';
import { 
  PerformanceDashboardResponseDto, 
  MonthlyRevenueDto, 
  LeadPipelineDto, 
  TopClientDto, 
  SummaryStatsDto 
} from './dto/performance-dashboard-response.dto';
import {
  ApiRevenueByClient,
  ApiLeadsByUser,
  ApiOverdueInvoices,
  ApiPerformanceDashboard,
  ApiExplainAnalyze
} from './decorators/api-analytics.decorators';

@ApiTags('Analytics')
@ApiExtraModels(
  RevenueByClientResponseDto, 
  LeadsByUserResponseDto, 
  PerformanceDashboardResponseDto,
  MonthlyRevenueDto,
  LeadPipelineDto,
  TopClientDto,
  SummaryStatsDto
)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue-by-client')
  @ApiRevenueByClient(RevenueByClientResponseDto)
  async getTotalRevenueByClient(
    @Query('limit', new ParseIntPipe({ optional: true, errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true, errorHttpStatusCode: HttpStatus.BAD_REQUEST })) offset?: number
  ): Promise<RevenueByClientResponseDto[]> {
    return this.analyticsService.getTotalRevenueByClient(limit, offset);
  }

  @Get('leads-by-user')
  @ApiLeadsByUser(LeadsByUserResponseDto)
  async getOpenLeadsByUser(
    @Query('limit', new ParseIntPipe({ optional: true, errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit?: number,
    @Query('status') status?: string
  ): Promise<LeadsByUserResponseDto[]> {
    return this.analyticsService.getOpenLeadsByUser(limit, status);
  }

  @Get('overdue-invoices')
  @ApiOverdueInvoices()
  async getOverdueInvoices(
    @Query('min-days', new ParseIntPipe({ optional: true, errorHttpStatusCode: HttpStatus.BAD_REQUEST })) minDays?: number,
    @Query('limit', new ParseIntPipe({ optional: true, errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit?: number
  ) {
    return this.analyticsService.getOverdueInvoices(minDays, limit);
  }

  @Get('performance-dashboard')
  @ApiPerformanceDashboard(PerformanceDashboardResponseDto)
  async getPerformanceDashboard(): Promise<PerformanceDashboardResponseDto> {
    return this.analyticsService.getPerformanceDashboard();
  }

  @Get('explain/revenue-by-client')
  @ApiExplainAnalyze('revenue by client')
  async explainRevenueQuery() {
    return this.analyticsService.explainRevenueByClientQuery();
  }

  @Get('explain/leads-by-user')
  @ApiExplainAnalyze('leads by user')
  async explainLeadsQuery() {
    return this.analyticsService.explainLeadsByUserQuery();
  }

  @Get('explain/overdue-invoices')
  @ApiExplainAnalyze('overdue invoices')
  async explainOverdueQuery() {
    return this.analyticsService.explainOverdueInvoicesQuery();
  }
} 