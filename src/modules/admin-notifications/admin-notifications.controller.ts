import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminNotificationsService } from './admin-notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Admin Notifications')
@ApiBearerAuth()
@Controller('admin-notifications')
@UseGuards(JwtAuthGuard, HierarchyAuthGuard)
@RequireHierarchy('OPERATOR')
export class AdminNotificationsController {
  constructor(private readonly service: AdminNotificationsService) { }

  @Get()
  @ApiOperation({ summary: 'Obter todas as notificações' })
  findAll() {
    return this.service.findAll();
  }

  @Get('unread')
  @ApiOperation({ summary: 'Obter notificações não lidas' })
  findUnread() {
    return this.service.findUnread();
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}
