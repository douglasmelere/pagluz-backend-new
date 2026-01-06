import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsBoolean,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { ConsumerType, PhaseType, ConsumerStatus, DocumentType } from '../../../common/enums';

export class CreateConsumerDto {
  @ApiProperty({
    description: 'Nome completo do consumidor',
    example: 'João Silva Santos',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tipo do documento',
    enum: DocumentType,
    example: DocumentType.CPF,
    required: false,
  })
  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @ApiProperty({
    description: 'CPF ou CNPJ do consumidor',
    example: '123.456.789-00',
  })
  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;

  @ApiProperty({
    description: 'Nome do representante (opcional)',
    example: 'Maria Representante',
    required: false,
  })
  @IsString()
  @IsOptional()
  representativeName?: string;

  @ApiProperty({
    description: 'RG do representante (opcional)',
    example: '12.345.678-9',
    required: false,
  })
  @IsString()
  @IsOptional()
  representativeRg?: string;

  @ApiProperty({
    description: 'Telefone do consumidor',
    example: '(48) 99999-9999',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'E-mail do consumidor',
    example: 'joao@email.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Concessionária de energia',
    example: 'CELESC',
  })
  @IsString()
  @IsNotEmpty()
  concessionaire: string;

  @ApiProperty({
    description: 'Número da UC (Unidade Consumidora)',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  ucNumber: string;

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
    description: 'Se o consumidor recebe WhatsApp',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  receiveWhatsapp?: boolean;

  @ApiProperty({
    description: 'Rua do endereço',
    example: 'Rua das Flores',
    required: false,
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
    required: false,
  })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Apto 101',
    required: false,
  })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    required: false,
  })
  @IsString()
  @IsOptional()
  neighborhood?: string;

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
    description: 'CEP',
    example: '88010-000',
    required: false,
  })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '1990-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({
    description: 'Observações',
    example: 'Cliente preferencial',
    required: false,
  })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiProperty({
    description: 'Data de chegada (relacionamento com representante)',
    example: '2024-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  arrivalDate?: string;

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

