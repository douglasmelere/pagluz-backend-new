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
exports.RepresentativesController = void 0;
const common_1 = require("@nestjs/common");
const representatives_service_1 = require("./representatives.service");
const create_representative_dto_1 = require("./dto/create-representative.dto");
const update_representative_dto_1 = require("./dto/update-representative.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_auth_guard_1 = require("../../common/guards/representative-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let RepresentativesController = class RepresentativesController {
    representativesService;
    constructor(representativesService) {
        this.representativesService = representativesService;
    }
    create(createRepresentativeDto) {
        return this.representativesService.create(createRepresentativeDto);
    }
    findAll() {
        return this.representativesService.findAll();
    }
    getStatistics() {
        return this.representativesService.getStatistics();
    }
    findOne(id) {
        return this.representativesService.findOne(id);
    }
    update(id, updateRepresentativeDto) {
        return this.representativesService.update(id, updateRepresentativeDto);
    }
    remove(id) {
        return this.representativesService.remove(id);
    }
    getRepresentativeStats(req) {
        return this.representativesService.getRepresentativeStats(req.user.id);
    }
    getRepresentativeProfile(req) {
        return this.representativesService.findOne(req.user.id);
    }
    updateRepresentativeProfile(req, updateRepresentativeDto) {
        return this.representativesService.update(req.user.id, updateRepresentativeDto);
    }
};
exports.RepresentativesController = RepresentativesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_representative_dto_1.CreateRepresentativeDto]),
    __metadata("design:returntype", void 0)
], RepresentativesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RepresentativesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RepresentativesController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RepresentativesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_representative_dto_1.UpdateRepresentativeDto]),
    __metadata("design:returntype", void 0)
], RepresentativesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RepresentativesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, common_1.UseGuards)(representative_auth_guard_1.RepresentativeAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RepresentativesController.prototype, "getRepresentativeStats", null);
__decorate([
    (0, common_1.Get)('dashboard/profile'),
    (0, common_1.UseGuards)(representative_auth_guard_1.RepresentativeAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RepresentativesController.prototype, "getRepresentativeProfile", null);
__decorate([
    (0, common_1.Patch)('dashboard/profile'),
    (0, common_1.UseGuards)(representative_auth_guard_1.RepresentativeAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_representative_dto_1.UpdateRepresentativeDto]),
    __metadata("design:returntype", void 0)
], RepresentativesController.prototype, "updateRepresentativeProfile", null);
exports.RepresentativesController = RepresentativesController = __decorate([
    (0, common_1.Controller)('representatives'),
    __metadata("design:paramtypes", [representatives_service_1.RepresentativesService])
], RepresentativesController);
//# sourceMappingURL=representatives.controller.js.map