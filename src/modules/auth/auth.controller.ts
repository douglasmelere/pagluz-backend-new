import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LogoutService } from '../../common/services/logout.service';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logoutService: LogoutService,
    private readonly auditService: AuditService,
  ) {}

  @ApiOperation({ summary: 'Login de usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    try {
      const result = await this.authService.login(loginDto);
      
      // Registra login no log de auditoria
      await this.auditService.logLogin(
        result.user.id,
        this.extractIpAddress(req),
        this.extractUserAgent(req)
      );

      return result;
    } catch (error) {
      // Registra tentativa de login falhada
      if (error instanceof HttpException) {
        await this.auditService.logSecurityEvent(
          undefined,
          'LOGIN_FAILED',
          { email: loginDto.email, reason: error.message },
          this.extractIpAddress(req),
          this.extractUserAgent(req)
        );
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Login de representante' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @Post('login-representative')
  async loginRepresentative(@Body() loginDto: LoginDto, @Request() req: any) {
    try {
      const result = await this.authService.loginRepresentative(loginDto);
      
      // Registra login do representante
      await this.auditService.logLogin(
        result.user.id,
        this.extractIpAddress(req),
        this.extractUserAgent(req)
      );

      return result;
    } catch (error) {
      // Registra tentativa de login falhada
      if (error instanceof HttpException) {
        await this.auditService.logSecurityEvent(
          undefined,
          'REPRESENTATIVE_LOGIN_FAILED',
          { email: loginDto.email, reason: error.message },
          this.extractIpAddress(req),
          this.extractUserAgent(req)
        );
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Logout de usuário' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    const token = req.token;
    const userId = req.user.id;
    const ipAddress = req.ipAddress;
    const userAgent = req.userAgent;

    const result = await this.logoutService.logout(userId, token, ipAddress, userAgent);
    return result;
  }

  @ApiOperation({ summary: 'Perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @ApiOperation({ summary: 'Criar usuário administrador (apenas SUPER_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create-admin')
  async createAdmin(@Body() createUserDto: any, @Request() req: any) {
    // Verifica se o usuário é SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new HttpException('Apenas SUPER_ADMIN pode criar usuários', HttpStatus.FORBIDDEN);
    }

    const result = await this.authService.createAdmin(createUserDto);
    
    // Registra criação de usuário
    await this.auditService.logCreate(
      req.user.id,
      'User',
      result.id,
      { ...createUserDto, password: '[HIDDEN]' },
      req.ipAddress,
      req.userAgent
    );

    return result;
  }

  @ApiOperation({ summary: 'Invalidar todas as sessões de um usuário (apenas SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Sessões invalidadas com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('force-logout/:userId')
  async forceLogoutUser(@Request() req: any, @Request() params: any) {
    // Verifica se o usuário é SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new HttpException('Apenas SUPER_ADMIN pode invalidar sessões', HttpStatus.FORBIDDEN);
    }

    const result = await this.logoutService.forceLogoutAllSessions(params.userId, 'ADMIN_FORCE_LOGOUT');
    
    // Registra ação administrativa
    await this.auditService.logSecurityEvent(
      req.user.id,
      'FORCE_LOGOUT_USER',
      { targetUserId: params.userId },
      req.ipAddress,
      req.userAgent
    );

    return result;
  }

  private extractIpAddress(req: any): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.connection?.socket?.remoteAddress || 
           'unknown';
  }

  private extractUserAgent(req: any): string {
    return req.headers['user-agent'] || 'unknown';
  }
}

