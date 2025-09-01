import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { LeadAnalysisResult, ChartData } from './ai-analysis.service';

export interface ChartGenerationOptions {
  title?: string;
  includeRawData?: boolean;
  colorScheme?: 'default' | 'professional' | 'vibrant';
  pageSize?: 'A4' | 'Letter';
}

/**
 * Service for generating PDF charts from lead analysis data
 */
@Injectable()
export class LeadAnalysisChartService {
  private readonly logger = new Logger(LeadAnalysisChartService.name);

  /**
   * Generate a PDF chart from analysis data
   */
  async generateAnalysisChartPdf(
    lead: any,
    analysis: LeadAnalysisResult,
    chartData: ChartData,
    options: ChartGenerationOptions = {}
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: options.pageSize || 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          this.logger.debug(`Generated PDF chart (${pdfBuffer.length} bytes)`);
          resolve(pdfBuffer);
        });

        // Generate PDF content
        this.generatePdfContent(doc, lead, analysis, chartData, options);
        
        doc.end();
      } catch (error) {
        this.logger.error('Failed to generate PDF chart', {
          error: error.message,
          leadId: lead?.id,
        });
        reject(error);
      }
    });
  }

  /**
   * Generate the main PDF content
   */
  private generatePdfContent(
    doc: any,
    lead: any,
    analysis: LeadAnalysisResult,
    chartData: ChartData,
    options: ChartGenerationOptions
  ): void {
    try {
      // Header
      this.generateHeader(doc, options.title || `Lead Analysis - ${lead.title}`);
      
      // Lead Info
      this.generateLeadInfo(doc, lead);
      
      // Charts and metrics
      this.generateCharts(doc, chartData);
      
      // Analysis details
      this.generateAnalysisDetails(doc, analysis);
      
      // Footer
      this.generateFooter(doc);
      
    } catch (error) {
      this.logger.warn('Error generating PDF content, using defaults', { error: error.message });
      
      // Fallback content
      doc.fontSize(20).text('Lead Analysis Report', 50, 50);
      doc.fontSize(12).text('Analysis data temporarily unavailable', 50, 100);
    }
  }

  private generateHeader(doc: any, title: string): void {
    doc.fontSize(24)
       .fillColor('#2c3e50')
       .text(title, 50, 50);
    
    doc.fontSize(10)
       .fillColor('#7f8c8d')
       .text(`Generated on ${new Date().toLocaleDateString()}`, 50, 80);
    
    // Line separator
    doc.moveTo(50, 100)
       .lineTo(550, 100)
       .strokeColor('#bdc3c7')
       .stroke();
  }

  private generateLeadInfo(doc: any, lead: any): void {
    doc.fontSize(16)
       .fillColor('#2c3e50')
       .text('Lead Information', 50, 120);
    
    doc.fontSize(11)
       .fillColor('#34495e')
       .text(`Title: ${lead.title || 'N/A'}`, 50, 145)
       .text(`Status: ${lead.status || 'N/A'}`, 50, 160)
       .text(`Priority: ${lead.priority || 'N/A'}`, 50, 175);
  }

  private generateCharts(doc: any, chartData: ChartData): void {
    doc.fontSize(16)
       .fillColor('#2c3e50')
       .text('Key Metrics', 50, 210);

    // Simple bar chart representation
    const metrics = [
      { label: 'Conversion Probability', value: chartData.conversionProbability },
      { label: 'Quality Score', value: chartData.qualityScore },
      { label: 'Priority Score', value: chartData.priorityScore },
      { label: 'Market Fit', value: chartData.marketFit }
    ];

    let yPos = 240;
    metrics.forEach((metric) => {
      doc.fontSize(10)
         .fillColor('#34495e')
         .text(`${metric.label}: ${metric.value}%`, 50, yPos);
      
      // Simple bar
      const barWidth = (metric.value / 100) * 200;
      doc.rect(200, yPos - 2, barWidth, 10)
         .fillColor('#3498db')
         .fill();
      
      yPos += 25;
    });
  }

  private generateAnalysisDetails(doc: any, analysis: LeadAnalysisResult): void {
    let yPos = 380;
    
    doc.fontSize(16)
       .fillColor('#2c3e50')
       .text('Analysis Details', 50, yPos);
    
    yPos += 30;
    
    // Recommended Actions
    doc.fontSize(12)
       .fillColor('#2c3e50')
       .text('Recommended Actions:', 50, yPos);
    
    yPos += 20;
    analysis.recommendedActions.forEach((action, index) => {
      doc.fontSize(10)
         .fillColor('#34495e')
         .text(`${index + 1}. ${action}`, 60, yPos);
      yPos += 15;
    });
    
    yPos += 10;
    
    // Risk Factors
    doc.fontSize(12)
       .fillColor('#e74c3c')
       .text('Risk Factors:', 50, yPos);
    
    yPos += 20;
    analysis.riskFactors.forEach((risk, index) => {
      doc.fontSize(10)
         .fillColor('#34495e')
         .text(`• ${risk}`, 60, yPos);
      yPos += 15;
    });
  }

  private generateFooter(doc: any): void {
    const pageHeight = doc.page.height;
    
    doc.fontSize(8)
       .fillColor('#95a5a6')
       .text('Generated by Education Server AI Analysis', 50, pageHeight - 50)
       .text(`Page 1`, 500, pageHeight - 50);
  }
} 