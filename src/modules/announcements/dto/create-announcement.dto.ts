import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Reunião de alinhamento' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Prezados representantes, informamos que haverá uma reunião...' })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
    description: 'Prioridade do comunicado',
  })
  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

  @ApiPropertyOptional({
    example: 'clxyz123...',
    description: 'ID do representante destinatário. Se não informado, envia para TODOS.',
  })
  @IsString()
  @IsOptional()
  representativeId?: string;
}
