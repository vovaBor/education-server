import { Injectable, Inject } from '@nestjs/common';
import { ILeadAssignmentService } from '../types/lead.types';
import type { ILeadRepository } from '../repositories/lead.repository.interface';
import { LEAD_REPOSITORY } from '../constants/tokens';

@Injectable()
export class LeadAssignmentService implements ILeadAssignmentService {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository
  ) {}

  /**
   * Assigns a lead to a specific user
   */
  async assignLead(leadId: number, userId: number): Promise<void> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new Error(`Lead with id ${leadId} not found`);
    }

    if (lead.isClosed()) {
      throw new Error('Cannot assign a closed lead');
    }

    await this.leadRepository.save(lead);
  }


} 
