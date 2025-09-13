"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../config/prisma.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    jwtService;
    prisma;
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Conta desativada');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new common_1.UnauthorizedException(`Conta bloqueada até ${user.lockedUntil.toISOString()}`);
        }
        if (user.failedLoginAttempts > 0) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: 0 },
            });
        }
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
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        if (user) {
            const newFailedAttempts = user.failedLoginAttempts + 1;
            let lockedUntil = null;
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
    async loginRepresentative(loginDto) {
        const representative = await this.validateRepresentative(loginDto.email, loginDto.password);
        if (!representative) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (representative.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Representante não está ativo');
        }
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
                commissionRate: representative.commissionRate,
                lastLoginAt: representative.lastLoginAt,
                loginCount: representative.loginCount,
            },
        };
    }
    async validateRepresentative(email, password) {
        const representative = await this.prisma.representative.findUnique({ where: { email } });
        if (representative && await bcrypt.compare(password, representative.password)) {
            return representative;
        }
        return null;
    }
    async createAdmin(createUserDto) {
        const { email, password, name, role } = createUserDto;
        if (!email || !password || !name || !role) {
            throw new common_1.BadRequestException('Todos os campos são obrigatórios');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Usuário com este email já existe');
        }
        const validRoles = ['ADMIN', 'MANAGER', 'OPERATOR'];
        if (!validRoles.includes(role)) {
            throw new common_1.BadRequestException('Role inválido');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
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
        const existingSuperAdmin = await this.prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' },
        });
        if (existingSuperAdmin) {
            throw new common_1.ConflictException('Já existe um SUPER_ADMIN no sistema');
        }
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map