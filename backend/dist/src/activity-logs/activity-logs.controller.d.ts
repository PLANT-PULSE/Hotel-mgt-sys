import { ActivityLogService } from '../common/services/activity-log.service';
import { UserRole, ActivityStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class ActivityLogsController {
    private activityLog;
    private prisma;
    constructor(activityLog: ActivityLogService, prisma: PrismaService);
    findAll(page?: number, limit?: number, action?: string, status?: ActivityStatus): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole | null;
            createdAt: Date;
            userId: string | null;
            status: import(".prisma/client").$Enums.ActivityStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            action: string;
            entity: string | null;
            entityId: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            browser: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    broadcast(body: {
        title: string;
        message: string;
        targetRole?: UserRole;
    }, user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        targetRole: import(".prisma/client").$Enums.UserRole | null;
        sentById: string;
        sentCount: number;
    }>;
    getEmergencyAlerts(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        type: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        message: string;
        severity: string;
        isResolved: boolean;
        resolvedAt: Date | null;
    }[]>;
}
