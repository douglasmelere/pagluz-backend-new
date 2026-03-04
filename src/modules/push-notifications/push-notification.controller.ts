import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PushNotificationService } from './push-notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Push Notifications')
@ApiBearerAuth()
@Controller('push-notifications')
export class PushNotificationController {
  constructor(private readonly service: PushNotificationService) { }

  // ─── Representante ──────────────────────────────────────────────────────────

  @Post('register')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Registrar token de push (Representante)' })
  register(@Request() req: any, @Body() body: { token: string; platform: string; deviceName?: string }) {
    return this.service.registerToken(req.user.id, body);
  }

  @Delete('unregister/:token')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Remover token de push (Representante)' })
  unregister(@Param('token') token: string) {
    return this.service.removeToken(token);
  }

  @Get('my-tokens')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Listar meus tokens de push (Representante)' })
  myTokens(@Request() req: any) {
    return this.service.getTokens(req.user.id);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  @Post('admin/send/:representativeId')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Enviar push para um representante (Admin)' })
  sendToOne(
    @Param('representativeId') representativeId: string,
    @Body() body: { title: string; body: string; data?: Record<string, string> },
  ) {
    return this.service.sendToRepresentative(representativeId, body);
  }

  @Post('admin/send-all')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('MANAGER')
  @ApiOperation({ summary: 'Enviar push para todos os representantes (Admin)' })
  sendToAll(@Body() body: { title: string; body: string; data?: Record<string, string> }) {
    return this.service.sendToAll(body);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Estatísticas de tokens registrados (Admin)' })
  getStats() {
    return this.service.getTokenStats();
  }
}
