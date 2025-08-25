import { LeadPriority } from '../types/lead.types';

/**
 * Constants for lead scoring system
 */
export const SCORING_CONSTANTS = {
  // Threshold values for value-based scoring
  VALUE_THRESHOLDS: {
    VERY_LOW: 1000,
    LOW: 5000,
    MEDIUM: 10000,
    HIGH: 25000,
    VERY_HIGH: 50000,
  },

  // Score points for value ranges
  VALUE_SCORES: {
    VERY_LOW: 10,      // <= 1000
    LOW: 30,           // <= 5000
    MEDIUM: 50,        // <= 10000
    HIGH: 70,          // <= 25000
    VERY_HIGH: 85,     // <= 50000
    PREMIUM: 100,      // > 50000
  },

  // Score points for priorities
  PRIORITY_SCORES: {
    [LeadPriority.LOW]: 25,
    [LeadPriority.MEDIUM]: 50,
    [LeadPriority.HIGH]: 75,
    [LeadPriority.URGENT]: 100,
  },

  // Threshold values for recency-based scoring (in days)
  RECENCY_THRESHOLDS: {
    SAME_DAY: 1,
    THREE_DAYS: 3,
    WEEK: 7,
    MONTH: 30,
  },

  // Score points for recency
  RECENCY_SCORES: {
    SAME_DAY: 100,     // <= 1 day
    THREE_DAYS: 80,    // <= 3 days
    WEEK: 60,          // <= 7 days
    MONTH: 40,         // <= 30 days
    OLD: 20,           // > 30 days
  },

  // Score points for existing clients
  CLIENT_SCORE: 80,

  // Factor weights
  FACTOR_WEIGHTS: {
    VALUE: 0.4,
    PRIORITY: 0.25,
    RECENCY: 0.2,
    CLIENT: 0.15,
  },

  DEFAULT_PRIORITY_SCORE: 50,
} as const; 
