import { Lead } from '../../domain/entities/lead.entity';
import { LeadResponseDto } from '../dto/lead-response.dto';

export class LeadResponseMapper {
  static toDto(lead: Lead): LeadResponseDto {
    return {
      id: lead.id,
      title: lead.title,
      description: lead.description,
      status: lead.status,
      priority: lead.priority,
      estimatedValue: lead.estimatedValue || null,
      expectedCloseDate: lead.expectedCloseDate || null,
      assignedUserId: lead.assignedUserId || null,
      clientId: lead.clientId || null,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    };
  }

  static toDtoArray(leads: Lead[]): LeadResponseDto[] {
    return leads.map(lead => this.toDto(lead));
  }
} 