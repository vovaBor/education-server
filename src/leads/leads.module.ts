import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

// Domain
import { Lead as TypeOrmLead } from './infrastructure/entities/typeorm-lead.entity';

// Infrastructure  
import { TypeOrmLeadRepository } from './infrastructure/repositories/typeorm-lead.repository';
import { LEAD_REPOSITORY } from './domain/constants/tokens';

// Application Services
import { CreateLeadUseCase } from './application/use-cases/create-lead.use-case';
import { LeadEnrichmentService } from './application/services/lead-enrichment.service';
import { LeadScoringService } from './domain/services/lead-scoring.service';

// AI Integration - Simplified
import { AiAnalysisService } from './application/services/ai-analysis.service';
import { LeadAnalysisChartService } from './application/services/lead-analysis-chart.service';
import { defaultMlvocaConfig, AI_PROVIDER_CONFIG } from './application/config/ai-provider.config';

// Controllers
import { LeadsController } from './application/controllers/leads.controller';
import { LeadAnalysisController } from './application/controllers/lead-analysis.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmLead]),
    CacheModule.register(),
  ],
  controllers: [
    LeadsController,
    LeadAnalysisController,
  ],
  providers: [
    // Repository
    {
      provide: LEAD_REPOSITORY,
      useClass: TypeOrmLeadRepository,
    },
    
    // Use Cases
    CreateLeadUseCase,
    
    // Services
    LeadScoringService,
    LeadEnrichmentService,
    
    // AI Integration - Simple
    AiAnalysisService,
    LeadAnalysisChartService,
    {
      provide: AI_PROVIDER_CONFIG,
      useValue: defaultMlvocaConfig,
    },
  ],
  exports: [
    CreateLeadUseCase,
    LeadScoringService,
    LeadEnrichmentService,
    AiAnalysisService,
  ],
})
export class LeadsModule {}
