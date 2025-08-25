import { Injectable, Inject } from '@nestjs/common';
import { ILeadScoringService, LeadScore, LeadScoringData, ScoreFactor, LeadPriority } from '../types/lead.types';
import type { ILeadRepository } from '../repositories/lead.repository.interface';
import { LEAD_REPOSITORY } from '../constants/tokens';
import { SCORING_CONSTANTS } from '../constants/scoring.constants';

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

    // Factor 1: Estimated Value
    if (leadData.estimatedValue) {
      const valueScore = this.calculateValueScore(leadData.estimatedValue);
      factors.push({
        name: 'Estimated Value',
        weight: SCORING_CONSTANTS.FACTOR_WEIGHTS.VALUE,
        value: valueScore,
      });
      totalScore += valueScore * SCORING_CONSTANTS.FACTOR_WEIGHTS.VALUE;
    }

    // Factor 2: Priority
    const priorityScore = this.calculatePriorityScore(leadData.priority);
    factors.push({
      name: 'Priority',
      weight: SCORING_CONSTANTS.FACTOR_WEIGHTS.PRIORITY,
      value: priorityScore,
    });
    totalScore += priorityScore * SCORING_CONSTANTS.FACTOR_WEIGHTS.PRIORITY;

    // Factor 3: Recency
    const recencyScore = this.calculateRecencyScore(leadData.createdAt);
    factors.push({
      name: 'Recency',
      weight: SCORING_CONSTANTS.FACTOR_WEIGHTS.RECENCY,
      value: recencyScore,
    });
    totalScore += recencyScore * SCORING_CONSTANTS.FACTOR_WEIGHTS.RECENCY;

    // Factor 4: Client relationship
    if (leadData.clientId) {
      const clientScore = this.calculateClientScore();
      factors.push({
        name: 'Existing Client',
        weight: SCORING_CONSTANTS.FACTOR_WEIGHTS.CLIENT,
        value: clientScore,
      });
      totalScore += clientScore * SCORING_CONSTANTS.FACTOR_WEIGHTS.CLIENT;
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
    if (estimatedValue <= SCORING_CONSTANTS.VALUE_THRESHOLDS.VERY_LOW) return SCORING_CONSTANTS.VALUE_SCORES.VERY_LOW;
    if (estimatedValue <= SCORING_CONSTANTS.VALUE_THRESHOLDS.LOW) return SCORING_CONSTANTS.VALUE_SCORES.LOW;
    if (estimatedValue <= SCORING_CONSTANTS.VALUE_THRESHOLDS.MEDIUM) return SCORING_CONSTANTS.VALUE_SCORES.MEDIUM;
    if (estimatedValue <= SCORING_CONSTANTS.VALUE_THRESHOLDS.HIGH) return SCORING_CONSTANTS.VALUE_SCORES.HIGH;
    if (estimatedValue <= SCORING_CONSTANTS.VALUE_THRESHOLDS.VERY_HIGH) return SCORING_CONSTANTS.VALUE_SCORES.VERY_HIGH;
    return SCORING_CONSTANTS.VALUE_SCORES.PREMIUM;
  }

  /**
   * Calculates score based on priority
   */
  private calculatePriorityScore(priority: LeadPriority): number {
    return SCORING_CONSTANTS.PRIORITY_SCORES[priority] || SCORING_CONSTANTS.DEFAULT_PRIORITY_SCORE;
  }

  /**
   * Calculates score based on how recently the lead was created
   * More recent leads get higher scores
   */
  private calculateRecencyScore(createdAt: Date): number {
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= SCORING_CONSTANTS.RECENCY_THRESHOLDS.SAME_DAY) return SCORING_CONSTANTS.RECENCY_SCORES.SAME_DAY;
    if (daysDiff <= SCORING_CONSTANTS.RECENCY_THRESHOLDS.THREE_DAYS) return SCORING_CONSTANTS.RECENCY_SCORES.THREE_DAYS;
    if (daysDiff <= SCORING_CONSTANTS.RECENCY_THRESHOLDS.WEEK) return SCORING_CONSTANTS.RECENCY_SCORES.WEEK;
    if (daysDiff <= SCORING_CONSTANTS.RECENCY_THRESHOLDS.MONTH) return SCORING_CONSTANTS.RECENCY_SCORES.MONTH;
    return SCORING_CONSTANTS.RECENCY_SCORES.OLD;
  }

  /**
   * Calculates score for existing client relationship
   */
  private calculateClientScore(): number {
    return SCORING_CONSTANTS.CLIENT_SCORE;
  }


} 