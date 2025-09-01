import { NotFoundException } from '@nestjs/common';

/**
 * Exception thrown when a lead is not found in the system
 */
export class LeadNotFoundException extends NotFoundException {
  constructor(leadId: number) {
    super(`Lead with ID ${leadId} not found`, 'LEAD_NOT_FOUND');
  }
} 