import { Injectable, Logger, Inject } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import axios, { AxiosInstance, AxiosError } from 'axios';
import type { Lead } from '../../domain/entities/lead.entity';
import type { AiProviderConfig } from '../config/ai-provider.config';
import { AI_PROVIDER_CONFIG } from '../config/ai-provider.config';
import {
  MarketSegment, 
  PRIORITY_SCORES,
  MARKET_SCORES
} from '../../domain/types/shared.types';
import { LeadPriority } from '../../domain/types/lead.types';
import { AiAnalysisResponseDto } from '../dto';

export interface LeadAnalysisResult {
  conversionProbability: number;
  qualityScore: number;
  estimatedTimeToClose: number;
  suggestedPriority: LeadPriority;
  marketSegment: MarketSegment;
  recommendedActions: string[];
  riskFactors: string[];
  strengths: string[];
  competitorThreats: string[];
  nextBestActions: string[];
}

export interface ChartData {
  conversionProbability: number;
  qualityScore: number;
  timeToCloseEstimate: number;
  riskLevel: number;
  strengthsCount: number;
  actionItemsCount: number;
  priorityScore: number;
  marketFit: number;
}

/**
 * AI analysis service with proper typing and retry mechanism
 * Integrates with external AI provider for lead analysis
 */
@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
  private readonly httpClient: AxiosInstance;

  constructor(@Inject(AI_PROVIDER_CONFIG) private readonly config: AiProviderConfig) {
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Analyzes a lead using AI service with retry mechanism
   * @param lead - Lead entity to analyze
   * @returns Promise<LeadAnalysisResult> - Analysis results or default fallback
   */
  async analyzeLead(lead: Lead): Promise<LeadAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting AI analysis for lead ${lead.id}`);
      
      const prompt = this.buildPrompt(lead);
      const response = await this.callApiWithRetry(prompt);
      const result = this.parseResponse(response.data.response);
      
      const duration = Date.now() - startTime;
      this.logger.log(`AI analysis completed for lead ${lead.id} in ${duration}ms`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`AI analysis failed for lead ${lead.id} after ${duration}ms: ${error.message}`);
      
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Converts analysis result to chart-friendly data format
   * @param analysis - Lead analysis result
   * @returns ChartData - Formatted data for chart generation
   */
  toChartData(analysis: LeadAnalysisResult): ChartData {
    return {
      conversionProbability: Math.round(analysis.conversionProbability * 100),
      qualityScore: analysis.qualityScore,
      timeToCloseEstimate: analysis.estimatedTimeToClose,
      riskLevel: Math.max(10, 100 - analysis.qualityScore),
      strengthsCount: analysis.strengths.length,
      actionItemsCount: analysis.recommendedActions.length + analysis.nextBestActions.length,
      priorityScore: PRIORITY_SCORES[analysis.suggestedPriority],
      marketFit: MARKET_SCORES[analysis.marketSegment],
    };
  }

  /**
   * Calls AI API with retry mechanism
   * @param prompt - Formatted prompt for AI analysis
   * @param retryCount - Current retry attempt (internal use)
   * @returns Promise with AI response
   */
  private async callApiWithRetry(prompt: string, retryCount = 0): Promise<any> {
    try {
      return await this.callApi(prompt);
    } catch (error) {
      if (retryCount < this.config.maxRetries && this.isRetriableError(error)) {
        this.logger.warn(`AI API call failed, retrying (${retryCount + 1}/${this.config.maxRetries}): ${error.message}`);
        
        await this.delay(this.config.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        return this.callApiWithRetry(prompt, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Makes HTTP request to AI provider
   * @param prompt - Formatted prompt string
   * @returns Promise with raw response
   */
  private async callApi(prompt: string) {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Invalid prompt: prompt cannot be empty');
    }

    return this.httpClient.post('/api/generate', {
      model: this.config.model,
      prompt,
      stream: false,
      options: { 
        temperature: 0.3, 
        top_p: 0.9, 
        max_tokens: 2000 
      }
    });
  }

  /**
   * Builds AI prompt from lead data
   * @param lead - Lead entity
   * @returns Formatted prompt string
   */
  private buildPrompt(lead: Lead): string {
    if (!lead || !lead.id) {
      throw new Error('Invalid lead: lead must have an ID');
    }

    const leadAge = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    
    return `Analyze this lead and return ONLY valid JSON:

Lead: ${lead.title || 'Untitled Lead'}
Description: ${lead.description || 'No description provided'}
Status: ${lead.status}
Priority: ${lead.priority}
Age: ${leadAge} days

Return this JSON structure:
{
  "conversionProbability": 0.75,
  "qualityScore": 80,
  "recommendedActions": ["Follow up", "Schedule demo"],
  "riskFactors": ["Budget concerns"],
  "strengths": ["High engagement"],
  "estimatedTimeToClose": 30,
  "suggestedPriority": "high",
  "marketSegment": "Mid-Market",
  "competitorThreats": ["Price competition"],
  "nextBestActions": ["Call prospect"]
}`;
  }

  /**
   * Parses and validates AI response
   * @param content - Raw AI response content
   * @returns Validated LeadAnalysisResult
   */
  private parseResponse(content: string): LeadAnalysisResult {
    try {
      const json = this.extractJson(content);
      return this.validateAndTransformResponse(json);
    } catch (error) {
      this.logger.warn(`Failed to parse AI response: ${error.message}`, {
        content: content?.substring(0, 200) + '...'
      });
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Extracts JSON from AI response, handling various formats
   * @param content - Raw response content
   * @returns Parsed JSON object
   */
  private extractJson(content: string) {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content: content must be a non-empty string');
    }

    // Remove thinking tags that some AI models include
    const cleaned = content.replace(/<think>[\s\S]*?<\/think>\s*/g, '');
    
    // Try to find JSON object in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleaned;
    
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      throw new Error(`Invalid JSON in AI response: ${parseError.message}`);
    }
  }

  /**
   * Validates and transforms raw AI response using class-validator
   * @param rawData - Raw response data from AI
   * @returns Validated LeadAnalysisResult
   */
  private validateAndTransformResponse(rawData: any): LeadAnalysisResult {
    // Transform raw data to DTO class
    const dto = plainToClass(AiAnalysisResponseDto, rawData);
    
    // Validate using class-validator
    const errors = validateSync(dto);
    
    if (errors.length > 0) {
      this.logger.warn(`AI response validation failed: ${JSON.stringify(errors.map(e => e.constraints))}`);
      // Return default DTO instance with proper fallback values
      return new AiAnalysisResponseDto();
    }
    
    // Return validated data if validation passes
    return dto;
  }

  /**
   * Provides default analysis when AI service fails
   * @returns Default LeadAnalysisResult
   */
  private getDefaultAnalysis(): LeadAnalysisResult {
    return new AiAnalysisResponseDto();
  }

  /**
   * Determines if an error is retriable
   * @param error - Error object
   * @returns boolean indicating if retry should be attempted
   */
  private isRetriableError(error: any): boolean {
    if (error instanceof AxiosError) {
      // Retry on network errors and 5xx server errors
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    }
    
    // Don't retry on validation or parsing errors
    return false;
  }

  /**
   * Delays execution for specified milliseconds
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
