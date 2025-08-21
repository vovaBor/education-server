import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { EmailService } from '../../services/email.service';
import { PdfService } from '../../services/pdf.service';
import { LeadEnrichmentService } from '../../../leads/application/services/lead-enrichment.service';
import { InvoiceDataService } from '../../../invoices/application/services/invoice-data.service';

export interface EmailJobData {
  invoiceId: number;
  clientEmail: string;
  clientName: string;
  dueDate: Date;
  amount: number;
}

export interface PdfJobData {
  invoiceId: number;
  clientId: number;
  sendToEmail?: string;
  clientName?: string;
}

export interface EnrichJobData {
  leadId: number;
  companyName?: string;
  email?: string;
}

@Processor('background-jobs')
export class UniversalJobProcessor {
  private readonly logger = new Logger(UniversalJobProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly pdfService: PdfService,
    private readonly enrichmentService: LeadEnrichmentService,
    private readonly invoiceDataService: InvoiceDataService,
  ) {}

  /**
   * Send invoice reminder email
   */
  @Process('send-email')
  async sendEmail(job: Job<EmailJobData>) {
    const startTime = Date.now();
    const context = { jobId: job.id, type: 'send-email' };
    
    try {
      this.logger.log('Starting email job', { ...context, data: job.data });
      
      const { clientEmail, clientName, dueDate, amount, invoiceId } = job.data;
      
      // Validate job data
      if (!clientEmail || !invoiceId) {
        throw new Error('Missing required email job data: clientEmail or invoiceId');
      }
      
      const invoiceNumber = `INV-${invoiceId}`;
      
      await this.emailService.sendInvoiceReminder(
        clientEmail,
        invoiceNumber,
        amount,
        new Date(dueDate),
        clientName,
      );
      
      const duration = Date.now() - startTime;
      this.logger.log(`Email sent successfully for invoice ${invoiceId}`, { 
        ...context,
        invoiceId, 
        clientEmail: this.maskEmail(clientEmail),
        duration 
      });
      
      return { success: true, invoiceId, sentAt: new Date() };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Email job failed', {
        ...context,
        error: error.message,
        stack: error.stack,
        jobData: job.data,
        duration
      });
      
      // Re-throw to trigger Bull's retry mechanism
      throw error;
    }
  }

  /**
   * Generate PDF and send via email
   */
  @Process('generate-pdf')
  async generatePdf(job: Job<PdfJobData>) {
    const startTime = Date.now();
    const context = { jobId: job.id, type: 'generate-pdf' };
    
    try {
      this.logger.log('Starting PDF generation job', { ...context, data: job.data });
      
      const { invoiceId, clientId, sendToEmail, clientName } = job.data;
      
      // Validate job data
      if (!invoiceId || !clientId) {
        throw new Error('Missing required PDF job data: invoiceId or clientId');
      }
      
      // Get invoice data
      const invoiceData = await this.invoiceDataService.getInvoiceData(invoiceId, clientId);
      
      if (!invoiceData) {
        throw new Error(`Invoice data not found for invoiceId: ${invoiceId}, clientId: ${clientId}`);
      }
      
      // Generate PDF
      const pdfBuffer = await this.pdfService.generateInvoicePdf(invoiceData);
      
      // Send via email
      const emailTo = sendToEmail || invoiceData.client.email;
      if (!emailTo) {
        throw new Error('No email address available for PDF delivery');
      }
      
      await this.emailService.sendInvoicePdf(
        emailTo,
        invoiceData.invoiceNumber,
        pdfBuffer,
        clientName || invoiceData.client.name,
      );
      
      const duration = Date.now() - startTime;
      this.logger.log(`PDF generated and sent for invoice ${invoiceId}`, {
        ...context,
        invoiceId,
        clientId,
        emailTo: this.maskEmail(emailTo),
        duration
      });
      
      return { success: true, invoiceId, clientId, sentAt: new Date() };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('PDF generation job failed', {
        ...context,
        error: error.message,
        stack: error.stack,
        jobData: job.data,
        duration
      });
      
      // Re-throw to trigger Bull's retry mechanism
      throw error;
    }
  }

  /**
   * Enrich lead data
   */
  @Process('enrich-lead')
  async enrichLead(job: Job<EnrichJobData>) {
    const startTime = Date.now();
    const context = { jobId: job.id, type: 'enrich-lead' };
    
    try {
      this.logger.log('Starting lead enrichment job', { ...context, data: job.data });
      
      const { leadId, companyName, email } = job.data;
      
      // Validate job data
      if (!leadId) {
        throw new Error('Missing required enrichment job data: leadId');
      }
      
      if (!companyName && !email) {
        throw new Error('At least one enrichment parameter (companyName or email) must be provided');
      }
      
      let enrichmentData: any = {
        enrichedAt: new Date(),
      };
      
      if (companyName) {
        this.logger.log(`Enriching company data for: ${companyName}`, context);
        const companyData = await this.enrichmentService.enrichCompanyData(companyName);
        enrichmentData = { ...enrichmentData, ...companyData };
      }
      
      if (email) {
        this.logger.log(`Enriching contact data for: ${this.maskEmail(email)}`, context);
        const contactData = await this.enrichmentService.enrichContactData(email);
        enrichmentData = { ...enrichmentData, ...contactData };
      }
      
      const duration = Date.now() - startTime;
      this.logger.log(`Lead ${leadId} enriched successfully`, {
        ...context,
        leadId,
        enrichedFields: Object.keys(enrichmentData),
        duration
      });
      
      return { success: true, leadId, enrichedData: enrichmentData };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Lead enrichment job failed', {
        ...context,
        error: error.message,
        stack: error.stack,
        jobData: job.data,
        duration
      });
      
      // Re-throw to trigger Bull's retry mechanism
      throw error;
    }
  }

  /**
   * Mask email for logging privacy
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username.substring(0, 2) + '*'.repeat(username.length - 2)
      : username;
    
    return `${maskedUsername}@${domain}`;
  }
} 
