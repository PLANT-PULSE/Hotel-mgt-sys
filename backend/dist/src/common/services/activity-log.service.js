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
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ActivityLogService = class ActivityLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(input) {
        return this.prisma.activityLog.create({
            data: {
                userId: input.userId,
                role: input.role,
                action: input.action,
                entity: input.entity,
                entityId: input.entityId,
                ipAddress: input.ipAddress,
                userAgent: input.userAgent,
                browser: input.browser ?? this.parseBrowser(input.userAgent),
                status: input.status ?? client_1.ActivityStatus.SUCCESS,
                metadata: input.metadata ?? undefined,
            },
        });
    }
    async findMany(options) {
        const page = options.page ?? 1;
        const limit = Math.min(options.limit ?? 50, 100);
        const skip = (page - 1) * limit;
        const where = {
            ...(options.userId && { userId: options.userId }),
            ...(options.action && { action: { contains: options.action, mode: 'insensitive' } }),
            ...(options.status && { status: options.status }),
        };
        const [data, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, email: true, firstName: true, lastName: true, role: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.activityLog.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    parseBrowser(userAgent) {
        if (!userAgent)
            return undefined;
        if (userAgent.includes('Chrome'))
            return 'Chrome';
        if (userAgent.includes('Firefox'))
            return 'Firefox';
        if (userAgent.includes('Safari'))
            return 'Safari';
        if (userAgent.includes('Edge'))
            return 'Edge';
        return 'Other';
    }
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map