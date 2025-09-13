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
exports.HierarchyAuthGuard = exports.RequireHierarchy = exports.HIERARCHY_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../config/prisma.service");
exports.HIERARCHY_KEY = 'hierarchy';
const RequireHierarchy = (minRole) => (0, common_1.SetMetadata)(exports.HIERARCHY_KEY, minRole);
exports.RequireHierarchy = RequireHierarchy;
let HierarchyAuthGuard = class HierarchyAuthGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const requiredRole = this.reflector.get(exports.HIERARCHY_KEY, context.getHandler());
        if (!requiredRole) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Usuário não autenticado');
        }
        const currentUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, isActive: true, lockedUntil: true },
        });
        if (!currentUser || !currentUser.isActive) {
            throw new common_1.ForbiddenException('Usuário inativo ou não encontrado');
        }
        if (currentUser.lockedUntil && currentUser.lockedUntil > new Date()) {
            throw new common_1.ForbiddenException('Conta temporariamente bloqueada');
        }
        if (!this.hasRequiredHierarchy(currentUser.role, requiredRole)) {
            throw new common_1.ForbiddenException(`Acesso negado. Nível mínimo requerido: ${requiredRole}`);
        }
        return true;
    }
    hasRequiredHierarchy(userRole, requiredRole) {
        const hierarchy = {
            'SUPER_ADMIN': 4,
            'ADMIN': 3,
            'MANAGER': 2,
            'OPERATOR': 1,
            'REPRESENTATIVE': 0,
        };
        return hierarchy[userRole] >= hierarchy[requiredRole];
    }
};
exports.HierarchyAuthGuard = HierarchyAuthGuard;
exports.HierarchyAuthGuard = HierarchyAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], HierarchyAuthGuard);
//# sourceMappingURL=hierarchy-auth.guard.js.map