import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ProposalRequestsService } from './proposal-requests.service';
import { CreateProposalRequestDto } from './dto/create-proposal-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Proposal Requests')
@ApiBearerAuth()
@Controller('proposal-requests')
export class ProposalRequestsController {
  constructor(private readonly proposalRequestsService: ProposalRequestsService) { }

  @Post('representative')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Solicitar nova proposta (Representante)' })
  create(@Request() req: any, @Body() dto: CreateProposalRequestDto) {
    const representativeId = req.user.id;
    return this.proposalRequestsService.create(representativeId, dto);
  }

  @Get('representative/my-requests')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Listar minhas solicitações de proposta (Representante)' })
  findMyRequests(@Request() req: any) {
    const representativeId = req.user.id;
    return this.proposalRequestsService.findByRepresentative(representativeId);
  }

  @Get('representative/:id/document')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Baixar arquivo da proposta gerada (Representante)' })
  downloadMyDocument(@Request() req: any, @Param('id') id: string, @Res() res: Response) {
    const representativeId = req.user.id;
    return this.proposalRequestsService.downloadDocument(id, res, representativeId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Listar todas as solicitações de proposta (Admin)' })
  findAll() {
    return this.proposalRequestsService.findAll();
  }

  @Patch(':id/generate')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Marcar proposta como gerada e anexar arquivo(opcional) (Admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF ou imagem da proposta (Opcional)',
        },
      },
    },
  })
  markAsGenerated(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.proposalRequestsService.markAsGenerated(id, file);
  }

  @Get(':id/document')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Baixar arquivo da proposta gerada (Admin)' })
  downloadDocumentAdmin(@Param('id') id: string, @Res() res: Response) {
    return this.proposalRequestsService.downloadDocument(id, res);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @ApiOperation({ summary: 'Excluir solicitação de proposta (Admin)' })
  delete(@Param('id') id: string) {
    return this.proposalRequestsService.delete(id);
  }
}
