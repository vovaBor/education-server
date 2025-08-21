import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QUEUE_NAME, JOB_CONFIG } from '../shared/jobs/constants/simple-queue.constants';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoiceJobsController } from './application/controllers/invoice-jobs.controller';
import { InvoicesController } from './application/controllers/invoices.controller';
import { UniversalJobProcessor } from '../shared/jobs/processors/universal-job.processor';
import { InvoiceRepository } from './repositories/invoice.repository';
import { InvoiceDataService } from './application/services/invoice-data.service';
import { InvoiceJobsService } from './application/services/invoice-jobs.service';
import { EmailService } from '../shared/services/email.service';
import { PdfService } from '../shared/services/pdf.service';
import { LeadEnrichmentService } from '../leads/application/services/lead-enrichment.service';

@Module({
  imports: [
    // TypeORM entities
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    
    // Bull queue for background job processing
    BullModule.registerQueue({
      name: QUEUE_NAME,
      defaultJobOptions: JOB_CONFIG,
    }),
  ],
  controllers: [
    InvoicesController,
    InvoiceJobsController,
  ],
  providers: [
    // Background job processor
    UniversalJobProcessor,

    // Repository services
    InvoiceRepository,
    
    // Business logic services
    InvoiceDataService,
    InvoiceJobsService,
    
    // Shared services
    EmailService,
    PdfService,
    LeadEnrichmentService,
  ],
  exports: [
    InvoiceRepository,
  ],
})
export class InvoicesModule {}
