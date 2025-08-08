import { Injectable, Inject } from '@nestjs/common';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';
import { LeadAssignmentService } from '../../domain/services/lead-assignment.service';
import { LEAD_REPOSITORY } from '../../domain/constants/tokens';

export interface AssignLeadCommand {
  leadId: number;
  userId: number;
}

export interface AssignLeadResult {
  success: boolean;
  message: string;
  leadId: number;
  assignedUserId: number;
}

@Injectable()
export class AssignLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository,
    private readonly leadAssignmentService: LeadAssignmentService,
  ) {}

  async execute(command: AssignLeadCommand): Promise<AssignLeadResult> {
    try {
      await this.leadAssignmentService.assignLead(command.leadId, command.userId);
      
      return {
        success: true,
        message: 'Lead assigned successfully',
        leadId: command.leadId,
        assignedUserId: command.userId,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign lead',
        leadId: command.leadId,
        assignedUserId: command.userId,
      };
    }
  }
} 