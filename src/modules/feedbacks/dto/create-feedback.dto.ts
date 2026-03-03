import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Tipo do feedback',
    enum: ['COMPLAINT', 'SUGGESTION', 'BUG', 'PRAISE'],
    example: 'SUGGESTION',
  })
  @IsEnum(['COMPLAINT', 'SUGGESTION', 'BUG', 'PRAISE'])
  type: string;

  @ApiProperty({
    description: 'Assunto / Título curto',
    example: 'Melhoria na tela de alocação',
  })
  @IsString()
  @MinLength(5, { message: 'O assunto deve ter no mínimo 5 caracteres' })
  @MaxLength(150, { message: 'O assunto deve ter no máximo 150 caracteres' })
  subject: string;

  @ApiProperty({
    description: 'Descrição detalhada do feedback',
    example: 'Seria muito útil ter um filtro por data na tela de alocação dos consumidores.',
  })
  @IsString()
  @MinLength(10, { message: 'A descrição deve ter no mínimo 10 caracteres' })
  description: string;

  @ApiPropertyOptional({
    description: 'Categoria (ex: Dashboard, Comissões, Alocação, Geral)',
    example: 'Alocação',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'URL do anexo (screenshot, documento)',
    example: 'https://supabase.pagluz.com.br/storage/v1/object/public/feedbacks/screenshot.png',
  })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({
    description: 'Nome do arquivo anexo',
    example: 'screenshot.png',
  })
  @IsOptional()
  @IsString()
  attachmentFileName?: string;
}
