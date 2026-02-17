"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumersModule = void 0;
const common_1 = require("@nestjs/common");
const consumers_service_1 = require("./consumers.service");
const consumer_change_requests_service_1 = require("./consumer-change-requests.service");
const consumers_controller_1 = require("./consumers.controller");
const prisma_service_1 = require("../../config/prisma.service");
const audit_service_1 = require("../../common/services/audit.service");
const supabase_storage_service_1 = require("../../common/services/supabase-storage.service");
const payment_proof_storage_service_1 = require("../../common/services/payment-proof-storage.service");
const ocr_service_1 = require("../../common/services/ocr.service");
const auth_module_1 = require("../auth/auth.module");
const commissions_service_1 = require("../commissions/commissions.service");
const settings_service_1 = require("../settings/settings.service");
let ConsumersModule = class ConsumersModule {
};
exports.ConsumersModule = ConsumersModule;
exports.ConsumersModule = ConsumersModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [consumers_controller_1.ConsumersController],
        providers: [
            consumers_service_1.ConsumersService,
            consumer_change_requests_service_1.ConsumerChangeRequestsService,
            prisma_service_1.PrismaService,
            audit_service_1.AuditService,
            commissions_service_1.CommissionsService,
            settings_service_1.SettingsService,
            supabase_storage_service_1.SupabaseStorageService,
            payment_proof_storage_service_1.PaymentProofStorageService,
            ocr_service_1.OcrService,
        ],
        exports: [consumers_service_1.ConsumersService, consumer_change_requests_service_1.ConsumerChangeRequestsService],
    })
], ConsumersModule);
//# sourceMappingURL=consumers.module.js.map