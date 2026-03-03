import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateFeedbackStatusDto {
  @ApiProperty({
    description: 'Novo status do feedback',
    enum: ['OPEN', 'IN_ANALYSIS', 'RESOLVED', 'REJECTED'],
    example: 'IN_ANALYSIS',
  })
  @IsEnum(['OPEN', 'IN_ANALYSIS', 'RESOLVED', 'REJECTED'])
  status: string;

  @ApiPropertyOptional({
    description: 'Prioridade do feedback (definida pelo admin)',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH',
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string;
}
