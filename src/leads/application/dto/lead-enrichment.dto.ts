import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class EnrichLeadDto {
  @ApiPropertyOptional({ 
    example: 'Acme Corp',
    description: 'Company name to enrich' 
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ 
    example: 'contact@acme.com',
    description: 'Email to enrich' 
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class EnrichLeadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Lead enrichment job started' })
  message: string;

  @ApiProperty({ example: '6' })
  jobId: string;

  @ApiProperty({ example: 1 })
  leadId: number;

  @ApiProperty({ example: 'processing' })
  status: string;
}
