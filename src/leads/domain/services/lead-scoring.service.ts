import { Injectable, Inject } from '@nestjs/common';
import { ILeadScoringService, LeadScore, LeadScoringData, ScoreFactor, LeadPriority } from '../types/lead.types';
import type { ILeadRepository } from '../repositories/lead.repository.interface';
import { LEAD_REPOSITORY } from '../constants/tokens';

@Injectable()
export class LeadScoringService implements ILeadScoringService {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepository: ILeadRepository
  ) {}

  /**
   * Calculates lead score based on various factors
   */
  calculateScore(leadData: LeadScoringData): LeadScore {
    const factors: ScoreFactor[] = [];
    let totalScore = 0;

    // Factor 1: Estimated Value (0-40 points)
    if (leadData.estimatedValue) {
      const valueScore = this.calculateValueScore(leadData.estimatedValue);
      factors.push({
        name: 'Estimated Value',
        weight: 0.4,
        value: valueScore,
      });
      totalScore += valueScore * 0.4;
    }

    // Factor 2: Priority (0-25 points)
    const priorityScore = this.calculatePriorityScore(leadData.priority);
    factors.push({
      name: 'Priority',
      weight: 0.25,
      value: priorityScore,
    });
    totalScore += priorityScore * 0.25;

    // Factor 3: Recency (0-20 points)
    const recencyScore = this.calculateRecencyScore(leadData.createdAt);
    factors.push({
      name: 'Recency',
      weight: 0.2,
      value: recencyScore,
    });
    totalScore += recencyScore * 0.2;

    // Factor 4: Client relationship (0-15 points)
    if (leadData.clientId) {
      const clientScore = this.calculateClientScore();
      factors.push({
        name: 'Existing Client',
        weight: 0.15,
        value: clientScore,
      });
      totalScore += clientScore * 0.15;
    }

    return {
      value: Math.round(totalScore),
      calculatedAt: new Date(),
      factors,
    };
  }

  /**
   * Updates the score for a specific lead
   */
  async updateScore(leadId: number): Promise<LeadScore> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new Error(`Lead with id ${leadId} not found`);
    }

    const scoringData: LeadScoringData = {
      estimatedValue: lead.estimatedValue,
      priority: lead.priority,
      clientId: lead.clientId,
      createdAt: lead.createdAt,
    };

    const score = this.calculateScore(scoringData);
    lead.updateScore(score);
    await this.leadRepository.save(lead);

    return score;
  }

  /**
   * Calculates score based on estimated value
   * Higher values get higher scores (0-100 scale)
   */
  private calculateValueScore(estimatedValue: number): number {
    if (estimatedValue <= 1000) return 10;
    if (estimatedValue <= 5000) return 30;
    if (estimatedValue <= 10000) return 50;
    if (estimatedValue <= 25000) return 70;
    if (estimatedValue <= 50000) return 85;
    return 100; // Above 50k
  }

  /**
   * Calculates score based on priority
   */
  private calculatePriorityScore(priority: LeadPriority): number {
    const priorityScores = {
      [LeadPriority.LOW]: 25,
      [LeadPriority.MEDIUM]: 50,
      [LeadPriority.HIGH]: 75,
      [LeadPriority.URGENT]: 100,
    };

    return priorityScores[priority] || 50;
  }

  /**
   * Calculates score based on how recently the lead was created
   * More recent leads get higher scores
   */
  private calculateRecencyScore(createdAt: Date): number {
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) return 100; // Same day
    if (daysDiff <= 3) return 80;  // Within 3 days
    if (daysDiff <= 7) return 60;  // Within a week
    if (daysDiff <= 30) return 40; // Within a month
    return 20; // Older than a month
  }

  /**
   * Calculates score for existing client relationship
   */
  private calculateClientScore(): number {
    return 80; // Existing clients get a bonus
  }


} 