import { Injectable } from '@nestjs/common';
import { InvoiceData } from '../../invoices/application/services/invoice-data.service';
import * as PDFKit from 'pdfkit';
const PDFDocument = PDFKit.default

/**
 * Service responsible for generating PDF documents.
 * Uses PDFKit for professional PDF generation.
 */
@Injectable()
export class PdfService {
  
  /**
   * Generates PDF buffer from invoice data.
   * 
   * @param invoiceData - Structured invoice data for PDF generation
   * @returns Promise resolving to PDF buffer
   */
  async generateInvoicePdf(invoiceData: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        // Collect PDF data
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('INVOICE', 50, 50);
        doc.fontSize(12).text(`Invoice #: ${invoiceData.invoiceNumber}`, 50, 80);
        doc.text(`Issue Date: ${new Date(invoiceData.issueDate).toLocaleDateString()}`, 50, 100);
        doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 50, 120);

        // Client Information
        doc.text('Bill To:', 50, 160);
        doc.text(invoiceData.client.name, 50, 180);
        doc.text(invoiceData.client.email, 50, 200);
        if (invoiceData.client.address) {
          doc.text(invoiceData.client.address, 50, 220);
        }

        // Items Table Header
        let yPosition = 280;
        doc.text('Description', 50, yPosition);
        doc.text('Qty', 300, yPosition);
        doc.text('Unit Price', 350, yPosition);
        doc.text('Total', 450, yPosition);
        
        // Draw line under header
        doc.moveTo(50, yPosition + 20).lineTo(550, yPosition + 20).stroke();
        yPosition += 40;

        // Items
        invoiceData.items.forEach((item) => {
          doc.text(item.description, 50, yPosition);
          doc.text(item.quantity.toString(), 300, yPosition);
          doc.text(`$${item.unitPrice.toFixed(2)}`, 350, yPosition);
          doc.text(`$${item.total.toFixed(2)}`, 450, yPosition);
          yPosition += 25;
        });

        // Totals
        yPosition += 20;
        doc.text(`Subtotal: $${invoiceData.subtotal.toFixed(2)}`, 350, yPosition);
        yPosition += 20;
        doc.text(`Tax: $${invoiceData.tax.toFixed(2)}`, 350, yPosition);
        yPosition += 20;
        doc.fontSize(14).text(`Total: $${invoiceData.total.toFixed(2)}`, 350, yPosition);

        // Footer
        doc.fontSize(10).text(
          `Generated on ${new Date().toLocaleDateString()}`,
          50,
          doc.page.height - 100
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
