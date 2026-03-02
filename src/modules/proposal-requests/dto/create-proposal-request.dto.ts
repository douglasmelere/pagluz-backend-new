import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { PhaseType } from '@prisma/client';

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

  @ApiProperty({ description: 'Valor em kWh' })
  @IsNumber()
  kwhValue: number;
}
