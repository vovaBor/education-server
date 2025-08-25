import { LeadPriority, LeadScoringData, LeadStatus } from '../../../types/lead.types';
import { Lead } from '../../../entities/lead.entity';
import { SCORING_CONSTANTS } from '../../../constants/scoring.constants';

export const TEST_CONSTANTS = {
  // Test IDs and values
  TEST_LEAD_ID: 1,
  INVALID_LEAD_ID: 999,
  CLIENT_ID: 123,
  FACTOR_COUNTS: {
    ALL_FACTORS: 4, // Value, Priority, Recency, Client
    WITHOUT_VALUE: 2, // Priority, Recency (no Value, no Client)
    WITHOUT_VALUE_WITH_CLIENT: 3, // Priority, Recency, Client (no Value)
    WITHOUT_CLIENT: 3, // Value, Priority, Recency (no Client)
  },
} as const;

// Date helpers
export const createDateDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const DATE_HELPERS = {
  today: () => new Date(),
  weekAgo: () => createDateDaysAgo(7),
  monthAgo: () => createDateDaysAgo(35),
} as const;

// Test data factories
export const createLeadScoringData = (overrides: Partial<LeadScoringData> = {}): LeadScoringData => ({
  estimatedValue: SCORING_CONSTANTS.VALUE_THRESHOLDS.HIGH,
  priority: LeadPriority.HIGH,
  clientId: TEST_CONSTANTS.CLIENT_ID,
  createdAt: new Date(),
  ...overrides,
});

// Interface for createTestLead overrides
interface CreateTestLeadOptions {
  id?: number;
  title?: string;
  description?: string | null;
  status?: LeadStatus;
  priority?: LeadPriority;
  estimatedValue?: number;
  expectedCloseDate?: Date;
  assignedUserId?: number;
  clientId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const createTestLead = (overrides: CreateTestLeadOptions={}): Lead => {
  const defaults = {
    id: TEST_CONSTANTS.TEST_LEAD_ID,
    title: 'Test Lead',
    description: 'Test Description',
    status: LeadStatus.OPEN,
    priority: LeadPriority.HIGH,
    estimatedValue: SCORING_CONSTANTS.VALUE_THRESHOLDS.HIGH,
    expectedCloseDate: undefined,
    assignedUserId: undefined,
    clientId: TEST_CONSTANTS.CLIENT_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  const lead = new Lead(
    defaults.id,
    defaults.title,
    defaults.description,
    defaults.status,
    defaults.priority,
    defaults.estimatedValue,
    defaults.expectedCloseDate,
    defaults.assignedUserId,
    defaults.clientId,
    defaults.createdAt,
    defaults.updatedAt
  );

  // Mock the updateScore method
  lead.updateScore = jest.fn();
  
  return lead;
};

// Test case generators
export const generateValueScoreTestCases = () => [
  { 
    value: SCORING_CONSTANTS.VALUE_THRESHOLDS.VERY_LOW, 
    expected: SCORING_CONSTANTS.VALUE_SCORES.VERY_LOW,
    description: 'very low threshold'
  },
  { 
    value: SCORING_CONSTANTS.VALUE_THRESHOLDS.LOW, 
    expected: SCORING_CONSTANTS.VALUE_SCORES.LOW,
    description: 'low threshold'
  },
  { 
    value: SCORING_CONSTANTS.VALUE_THRESHOLDS.MEDIUM, 
    expected: SCORING_CONSTANTS.VALUE_SCORES.MEDIUM,
    description: 'medium threshold'
  },
  { 
    value: SCORING_CONSTANTS.VALUE_THRESHOLDS.HIGH, 
    expected: SCORING_CONSTANTS.VALUE_SCORES.HIGH,
    description: 'high threshold'
  },
  { 
    value: SCORING_CONSTANTS.VALUE_THRESHOLDS.VERY_HIGH, 
    expected: SCORING_CONSTANTS.VALUE_SCORES.VERY_HIGH,
    description: 'very high threshold'
  },
  { 
    value: SCORING_CONSTANTS.VALUE_THRESHOLDS.VERY_HIGH + 1, 
    expected: SCORING_CONSTANTS.VALUE_SCORES.PREMIUM,
    description: 'premium value (above very high threshold)'
  },
];

export const generateRecencyScoreTestCases = () => [
  { 
    date: DATE_HELPERS.today(), 
    expected: SCORING_CONSTANTS.RECENCY_SCORES.SAME_DAY, 
    description: 'today (same day)' 
  },
  { 
    date: createDateDaysAgo(3), 
    expected: SCORING_CONSTANTS.RECENCY_SCORES.THREE_DAYS, 
    description: '3 days ago' 
  },
  { 
    date: DATE_HELPERS.weekAgo(), 
    expected: SCORING_CONSTANTS.RECENCY_SCORES.WEEK, 
    description: 'a week ago' 
  },
  { 
    date: createDateDaysAgo(30), 
    expected: SCORING_CONSTANTS.RECENCY_SCORES.MONTH, 
    description: '30 days ago' 
  },
  { 
    date: DATE_HELPERS.monthAgo(), 
    expected: SCORING_CONSTANTS.RECENCY_SCORES.OLD, 
    description: 'more than a month ago' 
  },
];

