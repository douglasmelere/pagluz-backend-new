import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verifica se a conta está ativa
    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada');
    }

    // Verifica se a conta está bloqueada
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(`Conta bloqueada até ${user.lockedUntil.toISOString()}`);
    }

    // Reseta contador de tentativas falhadas
    if (user.failedLoginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0 },
      });
    }

    // Atualiza estatísticas de login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      name: user.name 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    
    // Incrementa contador de tentativas falhadas
    if (user) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;
      
      // Bloqueia conta após 5 tentativas falhadas por 30 minutos
      if (newFailedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil,
        },
      });
    }
    
    return null;
  }

  async loginRepresentative(loginDto: LoginDto) {
    const representative = await this.validateRepresentative(loginDto.email, loginDto.password);
    
    if (!representative) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verifica se o representante está ativo
    if (representative.status !== 'ACTIVE') {
      throw new UnauthorizedException('Representante não está ativo');
    }

    // Atualiza estatísticas de login
    await this.prisma.representative.update({
      where: { id: representative.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

    const payload = { 
      email: representative.email, 
      sub: representative.id, 
      role: 'REPRESENTATIVE',
      name: representative.name 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: representative.id,
        email: representative.email,
        name: representative.name,
        role: 'REPRESENTATIVE',
        status: representative.status,
        lastLoginAt: representative.lastLoginAt,
        loginCount: representative.loginCount,
      },
    };
  }

  async validateRepresentative(email: string, password: string): Promise<any> {
    const representative = await this.prisma.representative.findUnique({ where: { email } });
    
    if (representative && await bcrypt.compare(password, representative.password)) {
      return representative;
    }
    
    return null;
  }

  async createAdmin(createUserDto: any) {
    const { email, password, name, role } = createUserDto;

    // Validações
    if (!email || !password || !name || !role) {
      throw new BadRequestException('Todos os campos são obrigatórios');
    }

    // Verifica se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Usuário com este email já existe');
    }

    // Valida o role
    const validRoles = ['ADMIN', 'MANAGER', 'OPERATOR'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Role inválido');
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Cria o usuário
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isActive: true,
        passwordChangedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async createDefaultAdmin() {
    // Verifica se já existe um SUPER_ADMIN
    const existingSuperAdmin = await this.prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existingSuperAdmin) {
      throw new ConflictException('Já existe um SUPER_ADMIN no sistema');
    }

    // Cria o SUPER_ADMIN (Douglas)
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const superAdmin = await this.prisma.user.create({
      data: {
        email: 'douglas@pagluz.com',
        password: hashedPassword,
        name: 'Douglas Melere',
        role: 'SUPER_ADMIN',
        isActive: true,
        passwordChangedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return superAdmin;
  }
}

