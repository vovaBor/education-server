import { IsNumber, IsString, IsArray, IsEnum, Min, Max, ArrayNotEmpty } from 'class-validator';
import { LeadPriority } from '../../domain/types/lead.types';
import { 
  MarketSegment, 
  SCORE_LIMITS
} from '../../domain/types/shared.types';

/**
 * DTO class for validating AI service response
 * Uses class-validator decorators for automatic validation
 */
export class AiAnalysisResponseDto {
  @IsNumber()
  @Min(SCORE_LIMITS.PROBABILITY_MIN)
  @Max(SCORE_LIMITS.PROBABILITY_MAX)
  conversionProbability: number = 0.5;

  @IsNumber()
  @Min(SCORE_LIMITS.QUALITY_MIN)
  @Max(SCORE_LIMITS.QUALITY_MAX)
  qualityScore: number = 50;

  @IsNumber()
  @Min(SCORE_LIMITS.TIME_MIN)
  @Max(SCORE_LIMITS.TIME_MAX)
  estimatedTimeToClose: number = 30;

  @IsEnum(LeadPriority)
  suggestedPriority: LeadPriority = LeadPriority.MEDIUM;

  @IsEnum(MarketSegment)
  marketSegment: MarketSegment = MarketSegment.MID_MARKET;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  recommendedActions: string[] = ['Follow up with prospect'];

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  riskFactors: string[] = ['Unknown risk factors'];

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  strengths: string[] = ['Potential identified'];

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  competitorThreats: string[] = ['Market competition'];

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  nextBestActions: string[] = ['Contact prospect'];
} 
