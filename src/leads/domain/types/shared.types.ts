import { LeadPriority } from './lead.types';

export enum MarketSegment {
  SMALL_BUSINESS = 'Small Business',
  MID_MARKET = 'Mid-Market', 
  ENTERPRISE = 'Enterprise',
}

export const PRIORITY_SCORES: Record<LeadPriority, number> = {
  [LeadPriority.LOW]: 25,
  [LeadPriority.MEDIUM]: 50,
  [LeadPriority.HIGH]: 75,
  [LeadPriority.URGENT]: 100,
} as const;

export const MARKET_SCORES: Record<MarketSegment, number> = {
  [MarketSegment.SMALL_BUSINESS]: 30,
  [MarketSegment.MID_MARKET]: 70,
  [MarketSegment.ENTERPRISE]: 90,
} as const;

export const SCORE_LIMITS = {
  PROBABILITY_MIN: 0,
  PROBABILITY_MAX: 1,
  QUALITY_MIN: 0,
  QUALITY_MAX: 100,
  TIME_MIN: 1,
  TIME_MAX: 365,
} as const; 
