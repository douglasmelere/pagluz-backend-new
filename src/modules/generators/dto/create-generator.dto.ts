import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { SourceType, GeneratorStatus } from '@prisma/client';

export class CreateGeneratorDto {
  @ApiProperty({
    description: 'Nome do proprietário ou empresa',
    example: 'Solar Energy Ltda',
  })
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do proprietário',
    example: '12.345.678/0001-90',
  })
  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;

  @ApiProperty({
    description: 'Tipo de fonte de energia',
    enum: SourceType,
    example: SourceType.SOLAR,
  })
  @IsEnum(SourceType)
  sourceType: SourceType;

  @ApiProperty({
    description: 'Potência instalada em kWh',
    example: 1500.75,
  })
  @IsNumber()
  @Min(0)
  installedPower: number;

  @ApiProperty({
    description: 'Concessionária de energia',
    example: 'CELESC',
  })
  @IsString()
  @IsNotEmpty()
  concessionaire: string;

  @ApiProperty({
    description: 'Número da UC (Unidade Consumidora)',
    example: '87654321',
  })
  @IsString()
  @IsNotEmpty()
  ucNumber: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'Florianópolis',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SC',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Status do gerador',
    enum: GeneratorStatus,
    example: GeneratorStatus.UNDER_ANALYSIS,
    required: false,
  })
  @IsEnum(GeneratorStatus)
  @IsOptional()
  status?: GeneratorStatus;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Instalação concluída em dezembro de 2023',
    required: false,
  })
  @IsString()
  @IsOptional()
  observations?: string;
}

