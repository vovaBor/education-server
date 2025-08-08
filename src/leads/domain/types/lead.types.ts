export enum LeadStatus {
  OPEN = 'open',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Value Objects
export interface LeadScore {
  value: number;
  calculatedAt: Date;
  factors: ScoreFactor[];
}

export interface ScoreFactor {
  name: string;
  weight: number;
  value: number;
}

// Domain Events
export interface LeadAssignedEvent {
  leadId: number;
  assignedUserId: number;
  assignedAt: Date;
  previousUserId?: number;
}

export interface LeadStatusChangedEvent {
  leadId: number;
  previousStatus: LeadStatus;
  newStatus: LeadStatus;
  changedAt: Date;
  changedBy?: number;
}

// Domain Interfaces
export interface ILeadScoringService {
  calculateScore(leadData: LeadScoringData): LeadScore;
  updateScore(leadId: number): Promise<LeadScore>;
}

export interface ILeadAssignmentService {
  assignLead(leadId: number, userId: number): Promise<void>;
}

export interface LeadScoringData {
  estimatedValue?: number;
  priority: LeadPriority;
  clientId?: number;
  createdAt: Date;
} 
