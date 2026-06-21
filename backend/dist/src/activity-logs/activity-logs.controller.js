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
exports.ActivityLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_log_service_1 = require("../common/services/activity-log.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ActivityLogsController = class ActivityLogsController {
    constructor(activityLog, prisma) {
        this.activityLog = activityLog;
        this.prisma = prisma;
    }
    findAll(page, limit, action, status) {
        return this.activityLog.findMany({
            page: Number(page) || 1,
            limit: Number(limit) || 50,
            action,
            status,
        });
    }
    async broadcast(body, user) {
        const message = await this.prisma.broadcastMessage.create({
            data: {
                title: body.title,
                message: body.message,
                targetRole: body.targetRole,
                sentById: user.id,
            },
        });
        await this.activityLog.log({
            userId: user.id,
            role: client_1.UserRole.SUPER_ADMIN,
            action: 'BROADCAST_SENT',
            entity: 'BroadcastMessage',
            entityId: message.id,
        });
        return message;
    }
    getEmergencyAlerts() {
        return this.prisma.emergencyAlert.findMany({
            where: { isResolved: false },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
};
exports.ActivityLogsController = ActivityLogsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.BUSINESS_OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", void 0)
], ActivityLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('broadcast'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ActivityLogsController.prototype, "broadcast", null);
__decorate([
    (0, common_1.Get)('emergency-alerts'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ActivityLogsController.prototype, "getEmergencyAlerts", null);
exports.ActivityLogsController = ActivityLogsController = __decorate([
    (0, swagger_1.ApiTags)('activity-logs'),
    (0, common_1.Controller)('activity-logs'),
    __metadata("design:paramtypes", [activity_log_service_1.ActivityLogService,
        prisma_service_1.PrismaService])
], ActivityLogsController);
//# sourceMappingURL=activity-logs.controller.js.map