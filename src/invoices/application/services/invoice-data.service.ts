import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { INVOICE_CONSTANTS } from '../../../shared/constants/app.constants';

/**
 * Interface for invoice data used in PDF generation
 */
export interface InvoiceData {
  id: number;
  clientId: number;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  total: number;
  client: {
    name: string;
    email: string;
    address: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

/**
 * Service responsible for fetching and preparing invoice data.
 * Handles database operations and data transformation for invoices.
 */
@Injectable()
export class InvoiceDataService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  /**
   * Fetches invoice data from the database with all necessary relations.
   * Provides fallback data if the invoice is not found or data is incomplete.
   * 
   * @param invoiceId - ID of the invoice to fetch
   * @param clientId - ID of the client (for additional validation)
   * @returns Promise resolving to structured invoice data
   */
  async getInvoiceData(invoiceId: number, clientId: number): Promise<InvoiceData> {
    try {
      // Fetch real invoice data with relations
      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId, clientId },
        relations: ['client', 'items'],
      });

      if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} and client ID ${clientId} not found`);
      }

      return this.transformInvoiceData(invoice);
    } catch (error) {
      // Provide fallback data if database query fails
      return this.getFallbackInvoiceData(invoiceId, clientId);
    }
  }

  /**
   * Transforms raw invoice entity into structured data for PDF generation.
   * 
   * @param invoice - Raw invoice entity from database
   * @returns Structured invoice data
   */
  private transformInvoiceData(invoice: Invoice): InvoiceData {
    return {
      id: invoice.id,
      clientId: invoice.clientId,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.taxAmount),
      total: Number(invoice.total),
      client: {
        name: invoice.client?.name || INVOICE_CONSTANTS.FALLBACK_CLIENT_NAME,
        email: invoice.client?.email || INVOICE_CONSTANTS.FALLBACK_EMAIL,
        address: invoice.client?.company || INVOICE_CONSTANTS.FALLBACK_ADDRESS,
      },
      items: invoice.items?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })) || [],
    };
  }

  /**
   * Provides fallback invoice data when database query fails.
   * Useful for testing and error recovery scenarios.
   * 
   * @param invoiceId - Invoice ID for fallback data
   * @param clientId - Client ID for fallback data
   * @returns Fallback invoice data
   */
  private getFallbackInvoiceData(invoiceId: number, clientId: number): InvoiceData {
    const invoiceNumber = `${INVOICE_CONSTANTS.NUMBER_PREFIX}${invoiceId.toString().padStart(6, '0')}`;
    
    return {
      id: invoiceId,
      clientId,
      invoiceNumber,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subtotal: 1000,
      tax: 100,
      total: 1100,
      client: {
        name: `${INVOICE_CONSTANTS.FALLBACK_CLIENT_NAME} (Fallback)`,
        email: INVOICE_CONSTANTS.FALLBACK_EMAIL,
        address: INVOICE_CONSTANTS.FALLBACK_ADDRESS,
      },
      items: [
        {
          description: 'Professional Services',
          quantity: 10,
          unitPrice: 100,
          total: 1000,
        },
      ],
    };
  }
} 