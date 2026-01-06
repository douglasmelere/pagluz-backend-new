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
exports.RepresentativeAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../config/prisma.service");
let RepresentativeAuthGuard = class RepresentativeAuthGuard {
    jwtService;
    prisma;
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new common_1.UnauthorizedException('Token de autorização não fornecido');
            }
            const token = authHeader.substring(7);
            const payload = this.jwtService.verify(token);
            if (payload.role !== 'REPRESENTATIVE') {
                throw new common_1.UnauthorizedException('Token inválido para representante');
            }
            const representative = await this.prisma.representative.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    status: true,
                    specializations: true,
                    city: true,
                    state: true,
                },
            });
            if (!representative) {
                throw new common_1.UnauthorizedException('Representante não encontrado');
            }
            if (representative.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Representante não está ativo');
            }
            request.user = {
                id: representative.id,
                email: representative.email,
                name: representative.name,
                role: 'REPRESENTATIVE',
                status: representative.status,
                specializations: representative.specializations,
                city: representative.city,
                state: representative.state,
            };
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Token inválido ou expirado');
            }
            throw new common_1.UnauthorizedException('Erro ao autenticar representante');
        }
    }
};
exports.RepresentativeAuthGuard = RepresentativeAuthGuard;
exports.RepresentativeAuthGuard = RepresentativeAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], RepresentativeAuthGuard);
//# sourceMappingURL=representative-auth.guard.js.map