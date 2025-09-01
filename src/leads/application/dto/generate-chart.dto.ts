import { IsInt, IsPositive, IsOptional, IsBoolean, IsString, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for path parameters when generating lead analysis chart
 */
export class GenerateChartParamsDto {
  @ApiProperty({
    description: 'Lead ID for analysis',
    example: 1,
    minimum: 1
  })
  @Type(() => Number)
  @IsInt({ message: 'ID must be an integer' })
  @IsPositive({ message: 'ID must be a positive number' })
  id: number;
}

/**
 * DTO for query parameters when generating analysis chart
 */
export class GenerateChartQueryDto {
  @ApiPropertyOptional({
    description: 'Include raw analysis data in PDF report',
    default: false
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean = false;

  @ApiPropertyOptional({
    description: 'Custom title for the analysis report',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Title cannot be longer than 100 characters' })
  customTitle?: string;
} 
