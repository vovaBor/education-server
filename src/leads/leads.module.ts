import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';

// Infrastructure
import { Lead as TypeOrmLead } from './infrastructure/entities/typeorm-lead.entity';
import { TypeOrmLeadRepository } from './infrastructure/repositories/typeorm-lead.repository';

// Domain
import { LeadScoringService } from './domain/services/lead-scoring.service';
import { LeadAssignmentService } from './domain/services/lead-assignment.service';

// Application
import { CreateLeadUseCase } from './application/use-cases/create-lead.use-case';
import { AssignLeadUseCase } from './application/use-cases/assign-lead.use-case';
import { UpdateLeadStatusUseCase } from './application/use-cases/update-lead-status.use-case';
import { LeadsController } from './application/controllers/leads.controller';

import { LeadEnrichmentService } from './application/services/lead-enrichment.service';
import { LeadJobsService } from './application/services/lead-jobs.service';

import { LEAD_REPOSITORY } from './domain/constants/tokens';
import { QUEUE_NAME, JOB_CONFIG } from '../shared/jobs/constants/simple-queue.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmLead]),
    BullModule.registerQueue({
      name: QUEUE_NAME,
      defaultJobOptions: JOB_CONFIG,
    }),
    
    // Register queue in Bull Board
    BullBoardModule.forFeature({
      name: QUEUE_NAME,
      adapter: BullAdapter,
    }),
  ],
  controllers: [LeadsController],
  providers: [
    // Repository
    {
      provide: LEAD_REPOSITORY,
      useClass: TypeOrmLeadRepository,
    },
    
    // Domain Services
    LeadScoringService,
    LeadAssignmentService,
    
    // Application Services
    LeadEnrichmentService,
    LeadJobsService,
    
    // Use Cases
    CreateLeadUseCase,
    AssignLeadUseCase,
    UpdateLeadStatusUseCase,
  ],
  exports: [
    LEAD_REPOSITORY,
    LeadScoringService,
    LeadAssignmentService,
    TypeOrmModule,
  ],
})
export class LeadsModule {}
