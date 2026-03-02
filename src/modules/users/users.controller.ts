import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AvatarStorageService } from '../../common/services/avatar-storage.service';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly avatarStorageService: AvatarStorageService,
  ) { }

  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Remover usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ─── Rotas de foto de perfil ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Fazer upload da foto de perfil do usuário autenticado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Imagem de perfil (JPEG, PNG ou WebP, máx. 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido (tipo ou tamanho)' })
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
    }),
  )
  async uploadMyAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const avatarUrl = await this.avatarStorageService.uploadAvatar(file, 'users', userId);
    const updated = await this.usersService.updateAvatar(userId, avatarUrl);
    return { message: 'Foto de perfil atualizada com sucesso', avatarUrl: updated.avatarUrl };
  }

  @ApiOperation({ summary: 'Remover foto de perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Foto de perfil removida com sucesso' })
  @Delete('me/avatar')
  @HttpCode(HttpStatus.OK)
  async removeMyAvatar(@Request() req) {
    const userId = req.user.id;
    await this.avatarStorageService.deleteAvatar('users', userId);
    await this.usersService.updateAvatar(userId, null);
    return { message: 'Foto de perfil removida com sucesso' };
  }

  @ApiOperation({ summary: 'Admin: fazer upload da foto de perfil de qualquer usuário' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Imagem de perfil (JPEG, PNG ou WebP, máx. 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil atualizada com sucesso' })
  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = await this.avatarStorageService.uploadAvatar(file, 'users', id);
    const updated = await this.usersService.updateAvatar(id, avatarUrl);
    return { message: 'Foto de perfil atualizada com sucesso', avatarUrl: updated.avatarUrl };
  }

  @ApiOperation({ summary: 'Admin: remover foto de perfil de qualquer usuário' })
  @ApiResponse({ status: 200, description: 'Foto de perfil removida com sucesso' })
  @Delete(':id/avatar')
  @HttpCode(HttpStatus.OK)
  async removeAvatar(@Param('id') id: string) {
    await this.avatarStorageService.deleteAvatar('users', id);
    await this.usersService.updateAvatar(id, null);
    return { message: 'Foto de perfil removida com sucesso' };
  }
}
