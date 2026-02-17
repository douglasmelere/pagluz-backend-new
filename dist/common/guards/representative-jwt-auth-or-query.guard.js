"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepresentativeJwtAuthOrQueryGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
let RepresentativeJwtAuthOrQueryGuard = class RepresentativeJwtAuthOrQueryGuard extends (0, passport_1.AuthGuard)('representative-jwt') {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (request.query.token) {
            request.headers.authorization = `Bearer ${request.query.token}`;
        }
        return super.canActivate(context);
    }
    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new common_1.UnauthorizedException('Token inválido ou expirado');
        }
        return user;
    }
};
exports.RepresentativeJwtAuthOrQueryGuard = RepresentativeJwtAuthOrQueryGuard;
exports.RepresentativeJwtAuthOrQueryGuard = RepresentativeJwtAuthOrQueryGuard = __decorate([
    (0, common_1.Injectable)()
], RepresentativeJwtAuthOrQueryGuard);
//# sourceMappingURL=representative-jwt-auth-or-query.guard.js.map