import { Injectable, Inject } from '@nestjs/common';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';
import { Lead } from '../../domain/entities/lead.entity';
import { LeadPriority } from '../../domain/types/lead.types';
import { LeadScoringService } from '../../domain/services/lead-scoring.service';
import { LEAD_REPOSITORY } from '../../domain/constants/tokens';

export interface CreateLeadCommand {
  title: string;
  description: string;
  priority?: LeadPriority;
  estimatedValue?: number;
  expectedCloseDate?: Date;
  clientId?: number;
}

export interface CreateLeadResult {
  success: boolean;
  message: string;
  leadId?: number;
  lead?: Lead;
}

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  async execute(command: CreateLeadCommand): Promise<CreateLeadResult> {
    try {
      // Create domain entity
      const lead = Lead.create(
        command.title,
        command.description,
        command.priority,
        command.estimatedValue,
        command.expectedCloseDate,
        command.clientId,
      );

      // Save the lead
      const savedLead = await this.leadRepository.save(lead);

      // Calculate initial score
      try {
        await this.leadScoringService.updateScore(savedLead.id);
      } catch (scoringError) {
        // Don't fail the creation if scoring fails
        console.warn('Failed to calculate initial lead score:', scoringError);
      }

      return {
        success: true,
        message: 'Lead created successfully',
        leadId: savedLead.id,
        lead: savedLead,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create lead',
      };
    }
  }
} 