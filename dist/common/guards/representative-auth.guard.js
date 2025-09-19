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
const prisma_service_1 = require("../../config/prisma.service");
let RepresentativeAuthGuard = class RepresentativeAuthGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const representative = await this.prisma.representative.findFirst({
                where: { status: 'ACTIVE' },
                select: { id: true, email: true, name: true },
            });
            if (!representative) {
                throw new common_1.UnauthorizedException('Nenhum representante ativo encontrado');
            }
            request.user = {
                id: representative.id,
                email: representative.email,
                name: representative.name,
                type: 'representative',
            };
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Erro ao autenticar representante');
        }
    }
};
exports.RepresentativeAuthGuard = RepresentativeAuthGuard;
exports.RepresentativeAuthGuard = RepresentativeAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RepresentativeAuthGuard);
//# sourceMappingURL=representative-auth.guard.js.map