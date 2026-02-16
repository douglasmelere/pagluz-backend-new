"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttlerConfig = exports.CustomThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let CustomThrottlerGuard = class CustomThrottlerGuard extends throttler_1.ThrottlerGuard {
    async getTracker(req) {
        return req.ip;
    }
};
exports.CustomThrottlerGuard = CustomThrottlerGuard;
exports.CustomThrottlerGuard = CustomThrottlerGuard = __decorate([
    (0, common_1.Injectable)()
], CustomThrottlerGuard);
const throttlerConfig = () => [
    {
        name: "global",
        ttl: 60 * 1000,
        limit: process.env.NODE_ENV === "production" ? 5000 : 10000,
    },
    {
        name: "auth",
        ttl: 15 * 60 * 1000,
        limit: 1000,
    },
    {
        name: "upload",
        ttl: 60 * 60 * 1000,
        limit: 500,
    },
];
exports.throttlerConfig = throttlerConfig;
//# sourceMappingURL=throttler.config.js.map