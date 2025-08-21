import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly repository: Repository<Invoice>,
  ) {}

  /**
   * Find invoice by ID with client relation loaded
   */
  async findByIdWithClient(id: number): Promise<Invoice | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['client'],
    });
  }

  /**
   * Find invoice by ID
   */
  async findById(id: number): Promise<Invoice | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Create a new invoice
   */
  async create(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const invoice = this.repository.create(invoiceData);
    return await this.repository.save(invoice);
  }

  /**
   * Check if invoice exists and is in valid state for reminders
   */
  async canSendReminder(id: number): Promise<{
    canSend: boolean;
    reason?: string;
    invoice?: Invoice;
  }> {
    const invoice = await this.findByIdWithClient(id);

    if (!invoice) {
      return { canSend: false, reason: 'Invoice not found' };
    }

    if (invoice.status === 'paid') {
      return { canSend: false, reason: 'Invoice already paid', invoice };
    }

    if (invoice.status === 'cancelled') {
      return { canSend: false, reason: 'Invoice is cancelled', invoice };
    }

    if (invoice.status === 'draft') {
      return { canSend: false, reason: 'Invoice is still in draft status', invoice };
    }

    if (!invoice.client) {
      return { canSend: false, reason: 'Invoice client not found', invoice };
    }

    if (!invoice.client.email) {
      return { canSend: false, reason: 'Client email not found', invoice };
    }

    return { canSend: true, invoice };
  }
} 