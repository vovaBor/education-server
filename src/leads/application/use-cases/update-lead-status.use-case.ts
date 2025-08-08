import { Injectable, Inject } from '@nestjs/common';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';
import { LeadStatus } from '../../domain/types/lead.types';
import { LEAD_REPOSITORY } from '../../domain/constants/tokens';

export interface UpdateLeadStatusCommand {
  leadId: number;
  newStatus: LeadStatus;
  changedBy?: number;
}

export interface UpdateLeadStatusResult {
  success: boolean;
  message: string;
  leadId: number;
  previousStatus?: LeadStatus;
  newStatus: LeadStatus;
}

@Injectable()
export class UpdateLeadStatusUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(command: UpdateLeadStatusCommand): Promise<UpdateLeadStatusResult> {
    try {
      const lead = await this.leadRepository.findById(command.leadId);
      
      if (!lead) {
        return {
          success: false,
          message: `Lead with id ${command.leadId} not found`,
          leadId: command.leadId,
          newStatus: command.newStatus,
        };
      }

      const previousStatus = lead.status;

      await this.leadRepository.save(lead);

      return {
        success: true,
        message: `Lead status updated from ${previousStatus} to ${command.newStatus}`,
        leadId: command.leadId,
        previousStatus,
        newStatus: command.newStatus,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update lead status',
        leadId: command.leadId,
        newStatus: command.newStatus,
      };
    }
  }
} 
