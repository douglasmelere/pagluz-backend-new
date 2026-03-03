import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RespondFeedbackDto {
  @ApiProperty({
    description: 'Mensagem de resposta',
    example: 'Obrigado pelo feedback! Vamos implementar essa melhoria na próxima versão.',
  })
  @IsString()
  @MinLength(5, { message: 'A resposta deve ter no mínimo 5 caracteres' })
  message: string;
}
