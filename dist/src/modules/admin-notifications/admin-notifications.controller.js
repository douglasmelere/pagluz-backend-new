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
exports.AdminNotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_notifications_service_1 = require("./admin-notifications.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let AdminNotificationsController = class AdminNotificationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    findUnread() {
        return this.service.findUnread();
    }
    markAsRead(id) {
        return this.service.markAsRead(id);
    }
};
exports.AdminNotificationsController = AdminNotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter todas as notificações' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminNotificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter notificações não lidas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminNotificationsController.prototype, "findUnread", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar notificação como lida' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminNotificationsController.prototype, "markAsRead", null);
exports.AdminNotificationsController = AdminNotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Admin Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin-notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    __metadata("design:paramtypes", [admin_notifications_service_1.AdminNotificationsService])
], AdminNotificationsController);
//# sourceMappingURL=admin-notifications.controller.js.map