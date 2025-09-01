import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiQuery,
  ApiProduces 
} from '@nestjs/swagger';
import { AnalysisLoggingInterceptor } from '../interceptors/analysis-logging.interceptor';
import { ChartResponseDto } from '../dto';

/**
 * Composite decorator for lead AI analysis chart generation endpoint
 * Combines all necessary decorators into a single reusable decorator
 * 
 * @returns Combined decorators for analysis chart endpoint
 */
export function AnalysisChart() {
  return applyDecorators(
    UseInterceptors(AnalysisLoggingInterceptor),
    ApiOperation({ 
      summary: 'Generate AI analysis chart for lead in PDF format',
      description: `
        Creates a detailed PDF report with AI lead analysis including:
        - Conversion probability assessment
        - Lead quality scoring
        - Recommended actions
        - Risk factors identification
        - Strengths analysis
        - Data visualization with charts
      `
    }),
    ApiParam({ 
      name: 'id', 
      type: Number,
      description: 'Unique identifier of the lead to analyze',
      example: 1 
    }),
    ApiQuery({
      name: 'includeRawData',
      required: false,
      type: Boolean,
      description: 'Include raw analysis data in the report',
      example: false
    }),
    ApiQuery({
      name: 'customTitle',
      required: false,
      type: String,
      description: 'Custom title for the analysis report',
      example: 'Lead Analysis - ABC Company'
    }),
    ApiProduces('application/pdf'),
    ApiResponse({ 
      status: 200, 
      description: 'PDF report successfully generated',
      type: ChartResponseDto,
      headers: {
        'Content-Type': { 
          description: 'MIME type of the file',
          schema: { type: 'string', example: 'application/pdf' }
        },
        'Content-Disposition': { 
          description: 'File download header',
          schema: { type: 'string', example: 'attachment; filename="lead-1-analysis.pdf"' }
        },
        'Content-Length': {
          description: 'File size in bytes',
          schema: { type: 'number' }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid request parameters' 
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Lead not found' 
    }),
    ApiResponse({ 
      status: 500, 
      description: 'Report generation failed' 
    })
  );
} 
