import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AssignLeadDto {
  @ApiProperty({
    description: 'ID of the user to assign the lead to',
    example: 456,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  userId: number;
} 