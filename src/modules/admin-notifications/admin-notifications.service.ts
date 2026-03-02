import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AdminNotificationsService {
  constructor(private prisma: PrismaService) { }

  async create(data: { title: string; message: string }) {
    return this.prisma.adminNotification.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUnread() {
    return this.prisma.adminNotification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.adminNotification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
