import { Injectable } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';

/**
 * Service for sending various types of emails.
 */
@Injectable()
export class EmailService {
  constructor(private readonly resendService: ResendService) {}

  /**
   * Sends invoice reminder email to client
   */
  async sendInvoiceReminder(
    to: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date,
    clientName?: string,
  ): Promise<void> {
    const subject = `Payment Reminder: Invoice ${invoiceNumber}`;
    const html = this.generateInvoiceReminderHtml(invoiceNumber, amount, dueDate, clientName);
    
    const emailData = {
      from: process.env.FROM_EMAIL as string,
      to,
      subject,
      html,
    };

    await this.resendService.send(emailData);
  }

  /**
   * Sends invoice PDF via email with attachment
   */
  async sendInvoicePdf(
    to: string,
    invoiceNumber: string,
    pdfBuffer: Buffer,
    clientName?: string,
  ): Promise<void> {
    const subject = `Invoice ${invoiceNumber} - PDF Copy`;
    const html = this.generateInvoicePdfHtml(invoiceNumber, clientName);
    
    const emailData = {
      from: process.env.FROM_EMAIL || '',
      to,
      subject,
      html,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await this.resendService.send(emailData);
  }

  /**
   * Generates HTML content for invoice PDF email
   */
  private generateInvoicePdfHtml(
    invoiceNumber: string,
    clientName?: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice PDF</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
            .invoice-number { font-size: 20px; font-weight: bold; color: #007bff; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 Invoice PDF</h1>
            </div>
            <div class="content">
              ${clientName ? `<p>Dear ${clientName},</p>` : '<p>Dear Customer,</p>'}
              
              <p>Please find attached your invoice PDF for <span class="invoice-number">${invoiceNumber}</span>.</p>
              
              <p>The PDF contains all the details of your invoice including:</p>
              <ul>
                <li>Invoice number and dates</li>
                <li>Itemized billing details</li>
                <li>Payment terms and instructions</li>
                <li>Company contact information</li>
              </ul>
              
              <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
              
              <p>Thank you for your business!</p>
            </div>
            <div class="footer">
              <p>This email contains your invoice as a PDF attachment.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generates HTML content for invoice reminder email
   */
  private generateInvoiceReminderHtml(
    invoiceNumber: string,
    amount: number,
    dueDate: Date,
    clientName?: string,
  ): string {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    const formattedDueDate = dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
            .amount { font-size: 24px; font-weight: bold; color: #dc3545; }
            .due-date { font-weight: bold; color: #fd7e14; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Reminder</h1>
            </div>
            <div class="content">
              ${clientName ? `<p>Dear ${clientName},</p>` : '<p>Dear Customer,</p>'}
              
              <p>This is a friendly reminder that your invoice is due for payment.</p>
              
              <p><strong>Invoice Details:</strong></p>
              <ul>
                <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
                <li><strong>Amount Due:</strong> <span class="amount">${formattedAmount}</span></li>
                <li><strong>Due Date:</strong> <span class="due-date">${formattedDueDate}</span></li>
              </ul>
              
              <p>Please process the payment at your earliest convenience to avoid any late fees.</p>
              
              <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
              
              <p>Thank you for your business!</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
} 
