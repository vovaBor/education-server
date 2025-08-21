import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import type { EnrichJobData } from '../../../shared/jobs/processors/universal-job.processor';
import { QUEUE_NAME, JOB_NAMES } from '../../../shared/jobs/constants/simple-queue.constants';
import { EnrichLeadDto } from '../dto/lead-enrichment.dto';

export interface EnrichLeadResult {
  success: boolean;
  message: string;
  jobId: string;
  leadId: number;
  status: string;
}

@Injectable()
export class LeadJobsService {
  private readonly logger = new Logger(LeadJobsService.name);

  constructor(
    @InjectQueue(QUEUE_NAME) private readonly jobQueue: Queue,
  ) {}

  /**
   * Schedule lead enrichment job
   */
  async enrichLead(leadId: number, enrichLeadDto: EnrichLeadDto): Promise<EnrichLeadResult> {
    this.logger.log(`Starting lead enrichment for lead ${leadId}`, { leadId, enrichLeadDto });

    // Validate input parameters
    this.validateEnrichmentParameters(enrichLeadDto);

    // Prepare job data
    const jobData = this.prepareEnrichmentJobData(leadId, enrichLeadDto);

    // Add job to queue
    const job = await this.addJobToQueue(JOB_NAMES.ENRICH_LEAD, jobData);

    const result: EnrichLeadResult = {
      success: true,
      message: 'Lead enrichment job started',
      jobId: job.id.toString(),
      leadId,
      status: 'processing',
    };

    this.logger.log(`Lead enrichment job scheduled for lead ${leadId}`, {
      jobId: job.id,
      leadId,
    });

    return result;
  }

  /**
   * Validate enrichment parameters
   */
  private validateEnrichmentParameters(enrichLeadDto: EnrichLeadDto): void {
    if (!enrichLeadDto.companyName && !enrichLeadDto.email) {
      throw new BadRequestException(
        'At least one enrichment parameter (companyName or email) must be provided'
      );
    }

    // Additional validation can be added here
    if (enrichLeadDto.email && !this.isValidEmail(enrichLeadDto.email)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  /**
   * Prepare enrichment job data
   */
  private prepareEnrichmentJobData(leadId: number, enrichLeadDto: EnrichLeadDto): EnrichJobData {
    return {
      leadId,
      companyName: enrichLeadDto.companyName,
      email: enrichLeadDto.email,
    };
  }

  /**
   * Add job to queue with error handling
   */
  private async addJobToQueue(jobName: string, jobData: any) {
    try {
      return await this.jobQueue.add(jobName, jobData);
    } catch (error) {
      this.logger.error(`Failed to add enrichment job to queue`, {
        jobName,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to schedule enrichment job: ${error.message}`);
    }
  }

  /**
   * Simple email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 
