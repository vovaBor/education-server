import { Controller, Post, Param, Body, ParseIntPipe, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBadRequestResponse, ApiNotFoundResponse, ApiExtraModels, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { ScheduleReminderDto, GeneratePdfDto } from '../dto/invoice-jobs.dto';
import { InvoiceJobsService } from '../services/invoice-jobs.service';

/**
 * Controller for invoice-related background job operations.
 * Handles scheduling of email reminders and PDF generation tasks.
 * 
 * This controller focuses only on HTTP concerns:
 * - Request/Response handling
 * - HTTP status codes
 * - API documentation
 * 
 * Business logic is delegated to InvoiceJobsService.
 */
@ApiTags('Invoice Jobs')
@ApiExtraModels(ScheduleReminderDto, GeneratePdfDto)
@Controller('invoices/:id/jobs')
export class InvoiceJobsController {
  private readonly logger = new Logger(InvoiceJobsController.name);

  constructor(
    private readonly invoiceJobsService: InvoiceJobsService,
  ) {}

  /**
   * Schedules an invoice payment reminder email.
   * 
   * @param invoiceId - ID of the invoice
   * @param data - Email reminder configuration
   * @returns Job scheduling confirmation
   */
  @Post('reminder')
  @ApiOperation({ summary: 'Schedule invoice reminder email' })
  @ApiParam({ name: 'id', description: 'Invoice ID', type: 'number' })
  @ApiResponse({ status: 201, description: 'Invoice reminder job scheduled successfully' })
  @ApiBadRequestResponse({ description: 'Invoice cannot receive reminders (paid, cancelled, draft, or missing client data)' })
  @ApiNotFoundResponse({ description: 'Invoice not found' })
  @ApiInternalServerErrorResponse({ description: 'Failed to schedule reminder job' })
  async scheduleInvoiceReminder(
    @Param('id', ParseIntPipe) invoiceId: number,
    @Body() data: ScheduleReminderDto,
  ) {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Scheduling reminder request for invoice ${invoiceId}`, { invoiceId });

      const result = await this.invoiceJobsService.scheduleReminder(invoiceId, data);

      this.logger.log(`Reminder request processed for invoice ${invoiceId}`, {
        jobId: result.jobId,
        duration: Date.now() - startTime
      });

      return result;

    } catch (error) {
      this.logger.error(`Failed to process reminder request for invoice ${invoiceId}`, {
        invoiceId,
        error: error.message,
        duration: Date.now() - startTime
      });
      
      throw error;
    }
  }

  /**
   * Initiates PDF generation for an invoice.
   * 
   * @param invoiceId - ID of the invoice
   * @param data - PDF generation parameters
   * @returns Job scheduling confirmation
   */
  @Post('pdf')
  @ApiOperation({ summary: 'Generate PDF invoice export' })
  @ApiParam({ name: 'id', description: 'Invoice ID', type: 'number' })
  @ApiResponse({ status: 201, description: 'PDF generation job started successfully' })
  @ApiNotFoundResponse({ description: 'Invoice not found' })
  @ApiBadRequestResponse({ description: 'Invalid client ID or invoice data' })
  @ApiInternalServerErrorResponse({ description: 'Failed to start PDF generation job' })
  async generateInvoicePdf(
    @Param('id', ParseIntPipe) invoiceId: number,
    @Body() data: GeneratePdfDto,
  ) {
    const startTime = Date.now();

    try {
      this.logger.log(`PDF generation request for invoice ${invoiceId}`, { invoiceId });

      const result = await this.invoiceJobsService.generatePdf(invoiceId, data);

      this.logger.log(`PDF generation request processed for invoice ${invoiceId}`, {
        jobId: result.jobId,
        duration: Date.now() - startTime
      });

      return result;

    } catch (error) {
      this.logger.error(`Failed to process PDF generation request for invoice ${invoiceId}`, {
        invoiceId,
        error: error.message,
        duration: Date.now() - startTime
      });
      
      throw error;
    }
  }
} 
