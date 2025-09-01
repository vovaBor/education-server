import { 
  Controller, 
  Get, 
  Param, 
  Query,
  StreamableFile,
  Inject 
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiAnalysisService } from '../services/ai-analysis.service';
import { LeadAnalysisChartService } from '../services/lead-analysis-chart.service';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';
import { LEAD_REPOSITORY } from '../../domain/constants/tokens';
import { 
  GenerateChartParamsDto, 
  GenerateChartQueryDto
} from '../dto';
import { 
  LeadNotFoundException, 
  ChartGenerationFailedException 
} from '../exceptions';
import { AnalysisChart } from '../decorators/analysis-chart.decorator';

/**
 * Controller for AI-powered lead analysis
 * Provides endpoints for generating AI analysis and PDF reports
 */
@ApiTags('Lead Analysis')
@Controller('leads')
export class LeadAnalysisController {
  constructor(
    private readonly aiService: AiAnalysisService,
    private readonly chartService: LeadAnalysisChartService,
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
  ) {}

  /**
   * Generates PDF chart with AI lead analysis
   * 
   * @param params - Request path parameters (lead ID)
   * @param query - Query parameters for report customization
   * @returns StreamableFile with PDF document
   */
  @Get(':id/analysis/chart')
  @AnalysisChart()
  async generateChart(
    @Param() params: GenerateChartParamsDto,
    @Query() query: GenerateChartQueryDto,
  ): Promise<StreamableFile> {
    const { id: leadId } = params;
    const { includeRawData = false, customTitle } = query;

    // Fetch lead from repository
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new LeadNotFoundException(leadId);
    }

    try {
      // Perform AI analysis
      const analysis = await this.aiService.analyzeLead(lead);
      const chartData = this.aiService.toChartData(analysis);

      // Determine report title
      const reportTitle = customTitle || `Analysis Report - ${lead.title}`;

      // Generate PDF report
      const pdfBuffer = await this.chartService.generateAnalysisChartPdf(
        lead,
        analysis,
        chartData,
        { 
          title: reportTitle,
          includeRawData 
        }
      );

      const filename = `lead-${leadId}-analysis.pdf`;

      // Return streamable file for efficient transfer
      return new StreamableFile(pdfBuffer, {
        type: 'application/pdf',
        disposition: `attachment; filename="${filename}"`,
        length: pdfBuffer.length,
      });

    } catch (error) {
      throw new ChartGenerationFailedException(leadId, error);
    }
  }
} 
