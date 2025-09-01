import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for PDF chart analysis response
 */
export class ChartResponseDto {
  @ApiProperty({
    description: 'Binary data of the PDF file',
    type: 'string',
    format: 'binary'
  })
  file: Buffer;

  @ApiProperty({
    description: 'Name of the generated file',
    example: 'lead-1-analysis.pdf'
  })
  filename: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf'
  })
  contentType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 125436
  })
  size: number;
} 
