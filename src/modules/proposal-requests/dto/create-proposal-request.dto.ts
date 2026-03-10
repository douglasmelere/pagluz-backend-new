import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ConsumerType, PhaseType } from '@prisma/client';

export class CreateProposalRequestDto {
  @ApiProperty({ description: 'Nome do cliente' })
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({ description: 'Valor total da fatura' })
  @IsNumber()
  invoiceAmount: number;

  @ApiProperty({ enum: PhaseType, description: 'Tipo de ligação (MONOPHASIC, BIPHASIC, TRIPHASIC)' })
  @IsEnum(PhaseType)
  phaseType: PhaseType;

  @ApiProperty({
    enum: ConsumerType,
    description: 'Tipo de unidade consumidora (RESIDENTIAL, COMMERCIAL, INDUSTRIAL, RURAL, PUBLIC_POWER)',
  })
  @IsEnum(ConsumerType)
  consumerType: ConsumerType;

  @ApiProperty({ description: 'Valor em kWh' })
  @IsNumber()
  kwhValue: number;
}
