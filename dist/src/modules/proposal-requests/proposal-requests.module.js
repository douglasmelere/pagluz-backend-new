"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const proposal_requests_service_1 = require("./proposal-requests.service");
const proposal_requests_controller_1 = require("./proposal-requests.controller");
const admin_notifications_module_1 = require("../admin-notifications/admin-notifications.module");
const prisma_service_1 = require("../../config/prisma.service");
const webhook_service_1 = require("../../common/services/webhook.service");
const push_notification_module_1 = require("../push-notifications/push-notification.module");
let ProposalRequestsModule = class ProposalRequestsModule {
};
exports.ProposalRequestsModule = ProposalRequestsModule;
exports.ProposalRequestsModule = ProposalRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [admin_notifications_module_1.AdminNotificationsModule, push_notification_module_1.PushNotificationModule],
        controllers: [proposal_requests_controller_1.ProposalRequestsController],
        providers: [proposal_requests_service_1.ProposalRequestsService, prisma_service_1.PrismaService, webhook_service_1.WebhookService],
    })
], ProposalRequestsModule);
//# sourceMappingURL=proposal-requests.module.js.map