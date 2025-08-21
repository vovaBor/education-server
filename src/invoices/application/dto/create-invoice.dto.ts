import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'INV-TEST-001' })
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  clientId: number;

  @ApiProperty({ example: '2025-08-01' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ example: '2025-08-25' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 'sent', enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] })
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  @IsOptional()
  status?: string = 'draft';

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ example: 0.10 })
  @IsNumber()
  @IsOptional()
  taxRate?: number = 0;

  @ApiProperty({ example: 15.00 })
  @IsNumber()
  @IsOptional()
  taxAmount?: number = 0;

  @ApiProperty({ example: 165.00 })
  @IsNumber()
  total: number;

  @ApiProperty({ example: 'Test invoice', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
} 