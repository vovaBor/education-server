import { LeadStatus, LeadPriority, LeadScore, LeadAssignedEvent, LeadStatusChangedEvent } from '../types/lead.types';

export class Lead {
  constructor(
    public readonly id: number,
    public title: string,
    public description: string | null,
    public status: LeadStatus,
    public priority: LeadPriority,
    public estimatedValue?: number,
    public expectedCloseDate?: Date,
    public assignedUserId?: number,
    public clientId?: number,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    private _score?: LeadScore,
  ) {}

  /**
   * Assigns the lead to a user
   */
  assignTo(userId: number): LeadAssignedEvent {
    const previousUserId = this.assignedUserId;
    this.assignedUserId = userId;

    return {
      leadId: this.id,
      assignedUserId: userId,
      assignedAt: new Date(),
      previousUserId,
    };
  }

  /**
   * Changes the lead status with business rules validation
   */
  changeStatus(newStatus: LeadStatus, changedBy?: number): LeadStatusChangedEvent {
    this.validateStatusTransition(this.status, newStatus);
    
    const previousStatus = this.status;
    this.status = newStatus;

    return {
      leadId: this.id,
      previousStatus,
      newStatus,
      changedAt: new Date(),
      changedBy,
    };
  }

  /**
   * Updates the lead score
   */
  updateScore(score: LeadScore): void {
    this._score = score;
  }

  /**
   * Checks if the lead is assigned
   */
  isAssigned(): boolean {
    return this.assignedUserId !== undefined && this.assignedUserId !== null;
  }

  /**
   * Checks if the lead is closed (won or lost)
   */
  isClosed(): boolean {
    return this.status === LeadStatus.WON || this.status === LeadStatus.LOST;
  }

  /**
   * Validates if status transition is allowed
   */
  private validateStatusTransition(currentStatus: LeadStatus, newStatus: LeadStatus): void {
    const validTransitions: Record<LeadStatus, LeadStatus[]> = {
      [LeadStatus.OPEN]: [LeadStatus.CONTACTED, LeadStatus.LOST],
      [LeadStatus.CONTACTED]: [LeadStatus.QUALIFIED, LeadStatus.LOST],
      [LeadStatus.QUALIFIED]: [LeadStatus.PROPOSAL, LeadStatus.LOST],
      [LeadStatus.PROPOSAL]: [LeadStatus.NEGOTIATION, LeadStatus.LOST],
      [LeadStatus.NEGOTIATION]: [LeadStatus.WON, LeadStatus.LOST],
      [LeadStatus.WON]: [],
      [LeadStatus.LOST]: [],
    };

    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  /**
   * Creates a new lead instance
   */
  static create(
    title: string,
    description: string,
    priority: LeadPriority = LeadPriority.MEDIUM,
    estimatedValue?: number,
    expectedCloseDate?: Date,
    clientId?: number,
  ): Lead {
    return new Lead(
      0, // Will be set by repository
      title,
      description,
      LeadStatus.OPEN,
      priority,
      estimatedValue,
      expectedCloseDate,
      undefined, // Not assigned initially
      clientId,
      new Date(),
      new Date(),
    );
  }
} 
