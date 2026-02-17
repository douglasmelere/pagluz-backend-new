import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtAuthOrQueryGuard } from '../../common/guards/jwt-auth-or-query.guard';
import { RepresentativeJwtAuthOrQueryGuard } from '../../common/guards/representative-jwt-auth-or-query.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Comissões')
@ApiBearerAuth()
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) { }

  @ApiOperation({ summary: 'Listar comissões do representante logado' })
  @ApiResponse({ status: 200, description: 'Lista de comissões do representante' })
  @Get('representative/my-commissions')
  @UseGuards(RepresentativeJwtAuthGuard)
  getMyCommissions(@Request() req: any) {
    const representativeId = req.user.id;
    return this.commissionsService.getRepresentativeCommissions(representativeId);
  }

  @ApiOperation({ summary: 'Obter estatísticas de comissões do representante' })
  @ApiResponse({ status: 200, description: 'Estatísticas de comissões' })
  @Get('representative/stats')
  @UseGuards(RepresentativeJwtAuthGuard)
  getMyCommissionStats(@Request() req: any) {
    const representativeId = req.user.id;
    return this.commissionsService.getRepresentativeCommissionStats(representativeId);
  }

  @ApiOperation({ summary: 'Buscar comissões por período' })
  @ApiResponse({ status: 200, description: 'Comissões do período especificado' })
  @ApiQuery({ name: 'startDate', description: 'Data inicial (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', description: 'Data final (YYYY-MM-DD)', example: '2024-12-31' })
  @Get('representative/by-period')
  @UseGuards(RepresentativeJwtAuthGuard)
  getCommissionsByPeriod(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const representativeId = req.user.id;
    return this.commissionsService.getCommissionsByPeriod(representativeId, startDate, endDate);
  }

  @ApiOperation({ summary: 'Obter detalhes de uma comissão específica' })
  @ApiResponse({ status: 200, description: 'Detalhes da comissão' })
  @ApiResponse({ status: 404, description: 'Comissão não encontrada' })
  @Get('representative/:id')
  @UseGuards(RepresentativeJwtAuthGuard)
  getCommissionDetails(@Param('id') commissionId: string) {
    return this.commissionsService.getCommissionDetails(commissionId);
  }

  @ApiOperation({ summary: 'Baixar comprovante de pagamento (Representante)' })
  @ApiResponse({ status: 200, description: 'Comprovante de pagamento' })
  @ApiResponse({ status: 404, description: 'Comprovante não encontrado' })
  @ApiQuery({ name: 'token', required: false, description: 'Token JWT (alternativa ao header Authorization)' })
  @Get('representative/:id/payment-proof')
  @UseGuards(RepresentativeJwtAuthOrQueryGuard)
  async downloadPaymentProofAsRepresentative(
    @Param('id') commissionId: string,
    @Res() res: Response,
  ) {
    const { buffer, fileName, mimeType } = await this.commissionsService.downloadPaymentProof(commissionId);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${fileName}"`,
    });

    res.send(buffer);
  }

  // Endpoints para administradores
  @ApiOperation({ summary: 'Listar todas as comissões (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Lista de todas as comissões' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get()
  getAllCommissions() {
    return this.commissionsService.getAllCommissions();
  }

  @ApiOperation({ summary: 'Listar comissões pendentes (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Lista de comissões pendentes' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get('pending')
  getPendingCommissions() {
    return this.commissionsService.getPendingCommissions();
  }

  @ApiOperation({ summary: 'Marcar comissão como paga (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Comissão marcada como paga com sucesso' })
  @ApiResponse({ status: 404, description: 'Comissão não encontrada' })
  @Post(':id/mark-paid')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  markCommissionAsPaid(@Param('id') commissionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.commissionsService.markCommissionAsPaid(commissionId, userId);
  }

  @ApiOperation({ summary: 'Upload de comprovante de pagamento (Admin/Operator)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Comprovante de pagamento (imagem ou PDF)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Comprovante enviado com sucesso' })
  @ApiResponse({ status: 404, description: 'Comissão não encontrada' })
  @Post(':id/payment-proof')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPaymentProof(
    @Param('id') commissionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    // Valida tipo de arquivo (imagem ou PDF)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido. Use imagens (JPG, PNG) ou PDF.');
    }

    // Valida tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Tamanho máximo: 5MB');
    }

    const userId = req.user.id;
    return this.commissionsService.uploadPaymentProof(commissionId, file, userId);
  }

  @ApiOperation({ summary: 'Baixar comprovante de pagamento (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Comprovante de pagamento' })
  @ApiResponse({ status: 404, description: 'Comprovante não encontrado' })
  @ApiQuery({ name: 'token', required: false, description: 'Token JWT (alternativa ao header Authorization)' })
  @Get(':id/payment-proof')
  @UseGuards(JwtAuthOrQueryGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  async downloadPaymentProof(
    @Param('id') commissionId: string,
    @Res() res: Response,
  ) {
    const { buffer, fileName, mimeType } = await this.commissionsService.downloadPaymentProof(commissionId);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${fileName}"`,
    });

    res.send(buffer);
  }

  @ApiOperation({ summary: 'Deletar comprovante de pagamento (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Comprovante deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Comprovante não encontrado' })
  @Delete(':id/payment-proof')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  deletePaymentProof(@Param('id') commissionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.commissionsService.deletePaymentProof(commissionId, userId);
  }

  @ApiOperation({ summary: 'Obter estatísticas gerais de comissões (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Estatísticas gerais de comissões' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get('admin/stats')
  async getAdminCommissionStats() {
    // Implementar estatísticas gerais para administradores
    // Por enquanto, retorna uma estrutura básica
    return {
      message: 'Estatísticas gerais de comissões - Em desenvolvimento',
      totalCommissions: 0,
      totalValue: 0,
      pendingCommissions: 0,
      paidCommissions: 0,
    };
  }
}
