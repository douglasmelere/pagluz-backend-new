import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ConsumerType, PhaseType, ConsumerStatus } from '@prisma/client';

export class CreateConsumerDto {
  @ApiProperty({
    description: 'Nome do consumidor',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do consumidor',
    example: '123.456.789-00',
  })
  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;

  @ApiProperty({
    description: 'Número da UC (Unidade Consumidora)',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  ucNumber: string;

  @ApiProperty({
    description: 'Concessionária de energia',
    example: 'CELESC',
  })
  @IsString()
  @IsNotEmpty()
  concessionaire: string;

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
    description: 'Tipo de consumidor',
    enum: ConsumerType,
    example: ConsumerType.RESIDENTIAL,
  })
  @IsEnum(ConsumerType)
  consumerType: ConsumerType;

  @ApiProperty({
    description: 'Tipo de fase',
    enum: PhaseType,
    example: PhaseType.MONOPHASIC,
  })
  @IsEnum(PhaseType)
  phase: PhaseType;

  @ApiProperty({
    description: 'Consumo médio mensal em kWh',
    example: 350.5,
  })
  @IsNumber()
  @Min(0)
  averageMonthlyConsumption: number;

  @ApiProperty({
    description: 'Desconto oferecido em porcentagem',
    example: 15.5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountOffered: number;

  @ApiProperty({
    description: 'Status de disponibilidade',
    enum: ConsumerStatus,
    example: ConsumerStatus.AVAILABLE,
    required: false,
  })
  @IsEnum(ConsumerStatus)
  @IsOptional()
  status?: ConsumerStatus;

  @ApiProperty({
    description: 'Porcentagem de energia alocada',
    example: 80.5,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  allocatedPercentage?: number;

  @ApiProperty({
    description: 'ID do gerador vinculado',
    example: 'clxxx123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  generatorId?: string;

  @ApiProperty({
    description: 'ID do representante que está cadastrando',
    example: 'clxxx123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  representativeId?: string;
}

