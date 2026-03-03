import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommercialMaterialDto {
  @ApiProperty({ example: 'Apresentação Comercial Q1 2025' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Apresentação para uso em reuniões de vendas' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Apresentações' })
  @IsString()
  @IsOptional()
  category?: string;
}
