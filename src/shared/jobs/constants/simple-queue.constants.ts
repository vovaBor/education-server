export const QUEUE_NAME = 'background-jobs';

export const JOB_NAMES = {
  SEND_EMAIL: 'send-email',
  GENERATE_PDF: 'generate-pdf',
  ENRICH_LEAD: 'enrich-lead',
} as const;

export const JOB_CONFIG = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
  removeOnComplete: 20,
  removeOnFail: 10,
} as const; 
