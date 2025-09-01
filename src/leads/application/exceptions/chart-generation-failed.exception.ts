import { InternalServerErrorException } from '@nestjs/common';

/**
 * Exception thrown when analysis chart generation fails
 */
export class ChartGenerationFailedException extends InternalServerErrorException {
  constructor(leadId: number, originalError?: Error) {
    super(
      `Failed to generate analysis chart for lead ${leadId}`,
      'CHART_GENERATION_FAILED'
    );
    
    if (originalError) {
      this.cause = originalError;
    }
  }
} 
