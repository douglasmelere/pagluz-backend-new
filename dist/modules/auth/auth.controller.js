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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const logout_service_1 = require("../../common/services/logout.service");
const audit_service_1 = require("../../common/services/audit.service");
let AuthController = class AuthController {
    authService;
    logoutService;
    auditService;
    constructor(authService, logoutService, auditService) {
        this.authService = authService;
        this.logoutService = logoutService;
        this.auditService = auditService;
    }
    async login(loginDto, req) {
        try {
            const result = await this.authService.login(loginDto);
            await this.auditService.logLogin(result.user.id, this.extractIpAddress(req), this.extractUserAgent(req));
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                await this.auditService.logSecurityEvent(undefined, 'LOGIN_FAILED', { email: loginDto.email, reason: error.message }, this.extractIpAddress(req), this.extractUserAgent(req));
            }
            throw error;
        }
    }
    async loginRepresentative(loginDto, req) {
        try {
            const result = await this.authService.loginRepresentative(loginDto);
            await this.auditService.logLogin(result.user.id, this.extractIpAddress(req), this.extractUserAgent(req));
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                await this.auditService.logSecurityEvent(undefined, 'REPRESENTATIVE_LOGIN_FAILED', { email: loginDto.email, reason: error.message }, this.extractIpAddress(req), this.extractUserAgent(req));
            }
            throw error;
        }
    }
    async logout(req) {
        const token = req.token;
        const userId = req.user.id;
        const ipAddress = req.ipAddress;
        const userAgent = req.userAgent;
        const result = await this.logoutService.logout(userId, token, ipAddress, userAgent);
        return result;
    }
    getProfile(req) {
        return req.user;
    }
    async createAdmin(createUserDto, req) {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.HttpException('Apenas SUPER_ADMIN pode criar usuários', common_1.HttpStatus.FORBIDDEN);
        }
        const result = await this.authService.createAdmin(createUserDto);
        await this.auditService.logCreate(req.user.id, 'User', result.id, { ...createUserDto, password: '[HIDDEN]' }, req.ipAddress, req.userAgent);
        return result;
    }
    async forceLogoutUser(req, params) {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.HttpException('Apenas SUPER_ADMIN pode invalidar sessões', common_1.HttpStatus.FORBIDDEN);
        }
        const result = await this.logoutService.forceLogoutAllSessions(params.userId, 'ADMIN_FORCE_LOGOUT');
        await this.auditService.logSecurityEvent(req.user.id, 'FORCE_LOGOUT_USER', { targetUserId: params.userId }, req.ipAddress, req.userAgent);
        return result;
    }
    extractIpAddress(req) {
        return req.ip ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.connection?.socket?.remoteAddress ||
            'unknown';
    }
    extractUserAgent(req) {
        return req.headers['user-agent'] || 'unknown';
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Login de usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login realizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciais inválidas' }),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Login de representante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login realizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciais inválidas' }),
    (0, common_1.Post)('login-representative'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginRepresentative", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Logout de usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout realizado com sucesso' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Perfil do usuário logado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil do usuário' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar usuário administrador (apenas SUPER_ADMIN)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuário criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('create-admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createAdmin", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Invalidar todas as sessões de um usuário (apenas SUPER_ADMIN)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sessões invalidadas com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('force-logout/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forceLogoutUser", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Autenticação'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        logout_service_1.LogoutService,
        audit_service_1.AuditService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map