import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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

import { LEAD_REPOSITORY } from './domain/constants/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmLead])],
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
