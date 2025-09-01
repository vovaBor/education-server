export interface AiProviderConfig {
  baseUrl: string;
  model: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

export const AI_PROVIDER_CONFIG = Symbol('AI_PROVIDER_CONFIG');

export const defaultMlvocaConfig: AiProviderConfig = {
  baseUrl: 'https://mlvoca.com',
  model: 'deepseek-r1:1.5b',
  timeout: 120000, // 2 minutes
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
}; 