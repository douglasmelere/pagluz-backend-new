import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ConsumersService } from './consumers.service';
import { ConsumerChangeRequestsService } from './consumer-change-requests.service';
import { CreateConsumerDto } from './dto/create-consumer.dto';
import { UpdateConsumerDto } from './dto/update-consumer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeAuthGuard } from '../../common/guards/representative-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Consumidores')
@ApiBearerAuth()
@Controller('consumers')
export class ConsumersController {
  constructor(
    private readonly consumersService: ConsumersService,
    private readonly changeRequestsService: ConsumerChangeRequestsService,
  ) {}

  @ApiOperation({ summary: 'Criar novo consumidor' })
  @ApiResponse({ status: 201, description: 'Consumidor criado com sucesso' })
  @ApiResponse({ status: 409, description: 'CPF/CNPJ já está cadastrado' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @Post()
  create(@Body() createConsumerDto: CreateConsumerDto) {
    return this.consumersService.create(createConsumerDto);
  }

  @ApiOperation({ summary: 'Criar novo consumidor (Representante)' })
  @ApiResponse({ status: 201, description: 'Consumidor criado com sucesso' })
  @ApiResponse({ status: 409, description: 'CPF/CNPJ já está cadastrado' })
  @Post('representative')
  @UseGuards(RepresentativeJwtAuthGuard)
  createAsRepresentative(
    @Body() createConsumerDto: CreateConsumerDto,
    @Request() req: any,
  ) {
    // O representante logado é automaticamente vinculado e entrada vai para aprovação
    const representativeId = req.user.id;
    return this.consumersService.createAsRepresentative(createConsumerDto, representativeId);
  }

  @ApiOperation({ summary: 'Listar consumidores do representante logado' })
  @ApiResponse({ status: 200, description: 'Lista de consumidores do representante' })
  @Get('representative/my-consumers')
  @UseGuards(RepresentativeJwtAuthGuard)
  findMyConsumers(@Request() req: any) {
    const representativeId = req.user.id;
    return this.consumersService.findByRepresentative(representativeId);
  }

  @ApiOperation({ summary: 'Listar todos os consumidores' })
  @ApiResponse({ status: 200, description: 'Lista de consumidores' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get()
  findAll() {
    return this.consumersService.findAll();
  }

  @ApiOperation({ summary: 'Obter estatísticas dos consumidores' })
  @ApiResponse({ status: 200, description: 'Estatísticas dos consumidores' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get('statistics')
  getStatistics() {
    return this.consumersService.getStatistics();
  }

  // IMPORTANTE: Rotas estáticas devem vir antes das rotas dinâmicas (ex.: :id)
  @ApiOperation({ summary: 'Listar consumidores pendentes de aprovação (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Lista de consumidores pendentes' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get('pending')
  findPending(
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('representativeId') representativeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.consumersService.findPending({
      state,
      city,
      representativeId,
      startDate,
      endDate,
      page: page || 1,
      limit: limit || 20,
    });
  }

  @ApiOperation({ summary: 'Buscar consumidores por estado' })
  @ApiResponse({ status: 200, description: 'Consumidores do estado' })
  @ApiQuery({ name: 'state', description: 'UF do estado', example: 'SC' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get('by-state')
  getByState(@Query('state') state: string) {
    return this.consumersService.getByState(state);
  }

  @ApiOperation({ summary: 'Buscar consumidor por ID' })
  @ApiResponse({ status: 200, description: 'Consumidor encontrado' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumersService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar consumidor' })
  @ApiResponse({ status: 200, description: 'Consumidor atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConsumerDto: UpdateConsumerDto) {
    return this.consumersService.update(id, updateConsumerDto);
  }

  @ApiOperation({ summary: 'Remover consumidor' })
  @ApiResponse({ status: 200, description: 'Consumidor removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consumersService.remove(id);
  }

  @ApiOperation({ summary: 'Alocar consumidor a um gerador' })
  @ApiResponse({ status: 200, description: 'Consumidor alocado com sucesso' })
  @ApiResponse({ status: 404, description: 'Consumidor ou gerador não encontrado' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @Post(':id/allocate')
  allocateToGenerator(
    @Param('id') consumerId: string,
    @Body() body: { generatorId: string; percentage: number },
  ) {
    return this.consumersService.allocateToGenerator(
      consumerId,
      body.generatorId,
      body.percentage,
    );
  }

  @ApiOperation({ summary: 'Desalocar consumidor de um gerador' })
  @ApiResponse({ status: 200, description: 'Consumidor desalocado com sucesso' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @Post(':id/deallocate')
  deallocate(@Param('id') consumerId: string) {
    return this.consumersService.deallocate(consumerId);
  }

  // Endpoints específicos para representantes
  @ApiOperation({ summary: 'Listar consumidores do representante com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de consumidores com filtros aplicados' })
  @Get('representative/filtered')
  @UseGuards(RepresentativeJwtAuthGuard)
  findRepresentativeConsumersWithFilters(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('approvalStatus') approvalStatus?: string,
    @Query('consumerType') consumerType?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const representativeId = req.user.id;
    return this.consumersService.findRepresentativeConsumersWithFilters(representativeId, {
      status: status as any,
      approvalStatus: approvalStatus as any,
      consumerType,
      state,
      city,
      startDate,
      endDate,
      page: page || 1,
      limit: limit || 20,
    });
  }

  @ApiOperation({ summary: 'Obter consumidor específico do representante' })
  @ApiResponse({ status: 200, description: 'Detalhes do consumidor' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @Get('representative/:id')
  @UseGuards(RepresentativeJwtAuthGuard)
  findRepresentativeConsumer(@Request() req: any, @Param('id') consumerId: string) {
    const representativeId = req.user.id;
    return this.consumersService.findRepresentativeConsumer(representativeId, consumerId);
  }

  @ApiOperation({ 
    summary: 'Atualizar consumidor (Representante)',
    description: 'Campos críticos (kWh, desconto, UC, concessionária, tipo, fase) requerem aprovação. Campos não críticos (contato, endereço, observações) são atualizados diretamente.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Consumidor atualizado. Campos críticos aguardam aprovação se houver.',
    schema: {
      type: 'object',
      properties: {
        consumer: { type: 'object' },
        changeRequest: { type: 'object', nullable: true },
        message: { type: 'string' },
        updatedFields: {
          type: 'object',
          properties: {
            direct: { type: 'array', items: { type: 'string' } },
            pending: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @Patch('representative/:id')
  @UseGuards(RepresentativeJwtAuthGuard)
  async updateRepresentativeConsumer(
    @Request() req: any,
    @Param('id') consumerId: string,
    @Body() updateConsumerDto: UpdateConsumerDto,
  ) {
    const representativeId = req.user.id;
    return this.consumersService.updateRepresentativeConsumerWithApproval(
      consumerId,
      representativeId,
      updateConsumerDto,
    );
  }

  @ApiOperation({ summary: 'Obter estatísticas dos consumidores do representante' })
  @ApiResponse({ status: 200, description: 'Estatísticas detalhadas dos consumidores' })
  @Get('representative/stats/overview')
  @UseGuards(RepresentativeJwtAuthGuard)
  getRepresentativeConsumerStats(@Request() req: any) {
    const representativeId = req.user.id;
    return this.consumersService.getRepresentativeConsumerStats(representativeId);
  }

  @ApiOperation({ summary: 'Obter histórico de atividades de um consumidor' })
  @ApiResponse({ status: 200, description: 'Histórico completo de atividades do consumidor' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @Get('representative/:id/activity-history')
  @UseGuards(RepresentativeJwtAuthGuard)
  getConsumerActivityHistory(@Request() req: any, @Param('id') consumerId: string) {
    const representativeId = req.user.id;
    return this.consumersService.getConsumerActivityHistory(representativeId, consumerId);
  }

  @ApiOperation({ summary: 'Aprovar consumidor (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Consumidor aprovado com sucesso' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Post(':id/approve')
  approveConsumer(@Param('id') consumerId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.consumersService.approveConsumer(consumerId, userId);
  }

  @ApiOperation({ summary: 'Rejeitar consumidor (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Consumidor rejeitado com sucesso' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Post(':id/reject')
  rejectConsumer(
    @Param('id') consumerId: string,
    @Body() body: { reason?: string },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.consumersService.rejectConsumer(consumerId, userId, body?.reason);
  }

  @ApiOperation({ summary: 'Gerar comissões para consumidores aprovados e alocados sem comissão (Admin)' })
  @ApiResponse({ status: 200, description: 'Comissões geradas com sucesso' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @Post('generate-commissions')
  generateCommissionsForApprovedConsumers() {
    return this.consumersService.generateCommissionsForApprovedConsumers();
  }

  @ApiOperation({ summary: 'Gerar comissões para consumidores aprovados sem comissão (mesmo sem alocação) (Admin)' })
  @ApiResponse({ status: 200, description: 'Comissões geradas com sucesso' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @Post('generate-commissions-all')
  generateCommissionsForApprovedConsumersWithoutAllocation() {
    return this.consumersService.generateCommissionsForApprovedConsumersWithoutAllocation();
  }

  @ApiOperation({ summary: 'Debug: Verificar consumidores elegíveis para comissão (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de consumidores elegíveis' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @Get('debug/eligible-consumers')
  async debugEligibleConsumers() {
    return this.consumersService.debugEligibleConsumers();
  }

  @ApiOperation({ summary: 'Debug: Verificar consumidores elegíveis para comissão (SEM AUTENTICAÇÃO - APENAS PARA DEBUG)' })
  @ApiResponse({ status: 200, description: 'Lista de consumidores elegíveis' })
  @Get('debug/eligible-consumers-public')
  async debugEligibleConsumersPublic() {
    return this.consumersService.debugEligibleConsumers();
  }

  @ApiOperation({ summary: 'Debug: Criar consumidor de teste (SEM AUTENTICAÇÃO - APENAS PARA DEBUG)' })
  @ApiResponse({ status: 200, description: 'Consumidor de teste criado' })
  @Post('debug/create-test-consumer')
  async createTestConsumer() {
    return this.consumersService.createTestConsumer();
  }

  @ApiOperation({ summary: 'Debug: Gerar comissões (SEM AUTENTICAÇÃO - APENAS PARA DEBUG)' })
  @ApiResponse({ status: 200, description: 'Comissões geradas' })
  @Post('debug/generate-commissions')
  async debugGenerateCommissions() {
    return this.consumersService.generateCommissionsForApprovedConsumersWithoutAllocation();
  }

  @ApiOperation({ summary: 'Debug: Simular anexação de representante e gerar comissão' })
  @ApiResponse({ status: 200, description: 'Representante anexado e comissão gerada' })
  @Post('debug/simulate-attach-representative')
  async simulateAttachRepresentative() {
    return this.consumersService.createTestConsumer();
  }

  @ApiOperation({ summary: 'Gerar comissão para um consumidor específico (Admin)' })
  @ApiResponse({ status: 200, description: 'Comissão gerada com sucesso' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @Post(':id/generate-commission')
  async generateCommissionForConsumer(@Param('id') consumerId: string) {
    return this.consumersService.generateCommissionForConsumer(consumerId);
  }

  @ApiOperation({ summary: 'Debug: Gerar comissão para um consumidor específico (SEM AUTENTICAÇÃO)' })
  @ApiResponse({ status: 200, description: 'Comissão gerada com sucesso' })
  @Post('debug/:id/generate-commission')
  async debugGenerateCommissionForConsumer(@Param('id') consumerId: string) {
    return this.consumersService.generateCommissionForConsumer(consumerId);
  }

  @ApiOperation({ summary: 'Debug: Aprovar consumidor (SEM AUTENTICAÇÃO)' })
  @ApiResponse({ status: 200, description: 'Consumidor aprovado' })
  @Post('debug/:id/approve')
  async debugApproveConsumer(@Param('id') consumerId: string) {
    return this.consumersService.approveConsumer(consumerId, 'debug-user');
  }

  // ========== ENDPOINTS DE FATURA ==========

  @ApiOperation({ summary: 'Upload de fatura para consumidor (Representante)' })
  @ApiResponse({ status: 200, description: 'Fatura enviada com sucesso' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo da fatura (PDF ou imagem)',
        },
      },
    },
  })
  @Post('representative/:id/invoice')
  @UseGuards(RepresentativeJwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(
    @Request() req: any,
    @Param('id') consumerId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    // Valida tipo de arquivo
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo não permitido. Use PDF ou imagem (JPG, PNG, WEBP)',
      );
    }

    const representativeId = req.user.id;
    return this.consumersService.uploadInvoice(
      consumerId,
      representativeId,
      file,
    );
  }

  @ApiOperation({ summary: 'Remover fatura de consumidor (Representante)' })
  @ApiResponse({ status: 200, description: 'Fatura removida com sucesso' })
  @Delete('representative/:id/invoice')
  @UseGuards(RepresentativeJwtAuthGuard)
  async removeInvoice(
    @Request() req: any,
    @Param('id') consumerId: string,
  ) {
    const representativeId = req.user.id;
    return this.consumersService.removeInvoice(consumerId, representativeId);
  }

  @ApiOperation({ summary: 'Download de fatura (Representante)' })
  @ApiResponse({ status: 200, description: 'Arquivo da fatura' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  @Get('representative/:id/invoice')
  @UseGuards(RepresentativeJwtAuthGuard)
  async downloadInvoice(
    @Request() req: any,
    @Param('id') consumerId: string,
    @Res() res: Response,
  ) {
    const representativeId = req.user.id;
    return this.consumersService.downloadInvoice(consumerId, representativeId, res);
  }

  @ApiOperation({ summary: 'Download de fatura (Admin)' })
  @ApiResponse({ status: 200, description: 'Arquivo da fatura' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  async downloadInvoiceAdmin(
    @Param('id') consumerId: string,
    @Res() res: Response,
  ) {
    return this.consumersService.downloadInvoiceAdmin(consumerId, res);
  }

  // ========== ENDPOINTS DE APROVAÇÃO DE MUDANÇAS ==========

  @ApiOperation({ summary: 'Listar solicitações de mudança pendentes (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações pendentes' })
  @Get('change-requests/pending')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  getPendingChangeRequests(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.changeRequestsService.getPendingRequests(
      page || 1,
      limit || 10,
    );
  }

  @ApiOperation({ summary: 'Listar solicitações de mudança do representante' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações do representante' })
  @Get('representative/change-requests')
  @UseGuards(RepresentativeJwtAuthGuard)
  getRepresentativeChangeRequests(@Request() req: any) {
    const representativeId = req.user.id;
    return this.changeRequestsService.getRepresentativeRequests(representativeId);
  }

  @ApiOperation({ summary: 'Aprovar solicitação de mudança (Admin)' })
  @ApiResponse({ status: 200, description: 'Mudança aprovada e aplicada' })
  @Post('change-requests/:id/approve')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  approveChangeRequest(@Request() req: any, @Param('id') changeRequestId: string) {
    const adminUserId = req.user.id;
    return this.changeRequestsService.approveChangeRequest(
      changeRequestId,
      adminUserId,
    );
  }

  @ApiOperation({ summary: 'Rejeitar solicitação de mudança (Admin)' })
  @ApiResponse({ status: 200, description: 'Mudança rejeitada' })
  @Post('change-requests/:id/reject')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  rejectChangeRequest(
    @Request() req: any,
    @Param('id') changeRequestId: string,
    @Body() body: { rejectionReason: string },
  ) {
    const adminUserId = req.user.id;
    if (!body.rejectionReason) {
      throw new BadRequestException('Motivo da rejeição é obrigatório');
    }
    return this.changeRequestsService.rejectChangeRequest(
      changeRequestId,
      adminUserId,
      body.rejectionReason,
    );
  }
}

