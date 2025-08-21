import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import type { EmailJobData, PdfJobData } from '../../../shared/jobs/processors/universal-job.processor';
import { QUEUE_NAME, JOB_NAMES } from '../../../shared/jobs/constants/simple-queue.constants';
import { calculateReminderDelay } from '../../../shared/jobs/utils/job.utils';
import { ScheduleReminderDto, GeneratePdfDto } from '../dto/invoice-jobs.dto';
import { InvoiceRepository } from '../../repositories/invoice.repository';

export interface ScheduleReminderResult {
  success: boolean;
  jobId?: string | number ;
  invoiceId: number;
  scheduledFor: Date;
  delay: number;
  message: string;
}

export interface GeneratePdfResult {
  success: boolean;
  jobId?: string | number ;
  invoiceId: number;
  status: string;
  message: string;
}

@Injectable()
export class InvoiceJobsService {
  private readonly logger = new Logger(InvoiceJobsService.name);

  constructor(
    @InjectQueue(QUEUE_NAME) private readonly jobQueue: Queue,
    private readonly invoiceRepository: InvoiceRepository,
  ) {}

  /**
   * Schedule an invoice reminder email
   */
  async scheduleReminder(
    invoiceId: number,
    reminderDto: ScheduleReminderDto,
  ): Promise<ScheduleReminderResult> {
    this.logger.log(`Scheduling reminder for invoice ${invoiceId}`, { invoiceId, reminderDto });

    // Validate invoice and get data
    const invoice = await this.validateInvoiceForReminder(invoiceId);
    
    // Calculate delay based on business rules
    const delay = this.calculateReminderDelay(invoice.dueDate, reminderDto);
    
    // Prepare job data
    const jobData = this.prepareEmailJobData(invoice);
    
    // Add job to queue
    const job = await this.addJobToQueue(JOB_NAMES.SEND_EMAIL, jobData, { delay });
    
    const result: ScheduleReminderResult = {
      success: true,
      jobId: job.id,
      invoiceId,
      scheduledFor: new Date(Date.now() + delay),
      delay,
      message: this.getReminderMessage(reminderDto),
    };

    this.logger.log(`Reminder scheduled successfully for invoice ${invoiceId}`, {
      jobId: job.id,
      delay,
    });

    return result;
  }

  /**
   * Generate PDF for an invoice
   */
  async generatePdf(
    invoiceId: number,
    pdfDto: GeneratePdfDto,
  ): Promise<GeneratePdfResult> {
    this.logger.log(`Starting PDF generation for invoice ${invoiceId}`, { invoiceId, pdfDto });

    // Validate invoice and client data
    const invoice = await this.validateInvoiceForPdf(invoiceId, pdfDto.clientId);
    
    // Prepare job data with fallbacks
    const jobData = this.preparePdfJobData(invoice, pdfDto);
    
    // Add job to queue
    const job = await this.addJobToQueue(JOB_NAMES.GENERATE_PDF, jobData);
    
    const result: GeneratePdfResult = {
      success: true,
      jobId: job.id,
      invoiceId,
      status: 'processing',
      message: 'PDF generation started',
    };

    this.logger.log(`PDF generation job started for invoice ${invoiceId}`, {
      jobId: job.id,
    });

    return result;
  }

  /**
   * Validate invoice can receive reminders and return invoice data
   */
  private async validateInvoiceForReminder(invoiceId: number) {
    const { canSend, reason, invoice } = await this.invoiceRepository.canSendReminder(invoiceId);

    if (!canSend) {
      if (reason === 'Invoice not found') {
        throw new NotFoundException(reason);
      }
      throw new BadRequestException(reason);
    }

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * Validate invoice exists and client matches
   */
  private async validateInvoiceForPdf(invoiceId: number, clientId: number) {
    const invoice = await this.invoiceRepository.findByIdWithClient(invoiceId);
    
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.clientId !== clientId) {
      throw new BadRequestException('Client ID does not match invoice');
    }

    if (!invoice.client) {
      throw new BadRequestException('Invoice client data not found');
    }

    return invoice;
  }

  /**
   * Calculate reminder delay based on business rules
   */
  private calculateReminderDelay(dueDate: Date, reminderDto: ScheduleReminderDto): number {
    if (reminderDto.delayHours !== undefined) {
      return reminderDto.delayHours * 60 * 60 * 1000; // Convert to milliseconds
    }
    
    if (reminderDto.immediate) {
      return 0;
    }
    
    return calculateReminderDelay(dueDate);
  }

  /**
   * Prepare email job data from invoice
   */
  private prepareEmailJobData(invoice: any): EmailJobData {
    return {
      invoiceId: invoice.id,
      clientEmail: invoice.client.email,
      clientName: invoice.client.name,
      dueDate: invoice.dueDate,
      amount: this.safeNumberConversion(invoice.total),
    };
  }

  /**
   * Prepare PDF job data with fallbacks
   */
  private preparePdfJobData(invoice: any, pdfDto: GeneratePdfDto): PdfJobData {
    return {
      invoiceId: invoice.id,
      clientId: pdfDto.clientId,
      sendToEmail: pdfDto.sendToEmail || invoice.client.email,
      clientName: pdfDto.clientName || invoice.client.name,
    };
  }

  /**
   * Add job to queue with error handling
   */
  private async addJobToQueue(jobName: string, jobData: any, options: any = {}) {
    try {
      return await this.jobQueue.add(jobName, jobData, options);
    } catch (error) {
      this.logger.error(`Failed to add job to queue`, {
        jobName,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to schedule job: ${error.message}`);
    }
  }

  /**
   * Generate appropriate message based on reminder settings
   */
  private getReminderMessage(reminderDto: ScheduleReminderDto): string {
    if (reminderDto.immediate) {
      return 'Reminder sent immediately';
    }
    
    if (reminderDto.delayHours !== undefined) {
      return `Reminder scheduled for ${reminderDto.delayHours} hours`;
    }
    
    return 'Reminder scheduled for 3 days before due date';
  }

  /**
   * Safely converts a value to number, throwing BadRequestException if invalid
   */
  private safeNumberConversion(value: any): number {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
      throw new BadRequestException(`Invalid number value: ${value}`);
    }
    return num;
  }
} 
