import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { InvoiceRepository } from '../../repositories/invoice.repository';

/**
 * Controller for invoice CRUD operations.
 * Handles creation, reading, updating, and deletion of invoices.
 */
@ApiTags('Invoices')
@ApiExtraModels(CreateInvoiceDto)
@Controller('invoices')
export class InvoicesController {
  private readonly logger = new Logger(InvoicesController.name);

  constructor(
    private readonly invoiceRepository: InvoiceRepository,
  ) {}

  /**
   * Create a new invoice
   */
  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    try {
      this.logger.log('Creating new invoice', { invoiceNumber: createInvoiceDto.invoiceNumber });

      const invoiceData = {
        ...createInvoiceDto,
        issueDate: new Date(createInvoiceDto.issueDate),
        dueDate: new Date(createInvoiceDto.dueDate),
      };

      const invoice = await this.invoiceRepository.create(invoiceData);

      this.logger.log(`Invoice created successfully`, {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber
      });

      return {
        success: true,
        message: 'Invoice created successfully',
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientId: invoice.clientId,
          status: invoice.status,
          total: invoice.total,
        },
      };

    } catch (error) {
      this.logger.error('Failed to create invoice', {
        error: error.message,
        invoiceNumber: createInvoiceDto.invoiceNumber
      });
      throw error;
    }
  }
} 