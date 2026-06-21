import { PrismaService } from '../../prisma/prisma.service';
import { ActivityStatus, UserRole, Prisma } from '@prisma/client';
export interface LogActivityInput {
    userId?: string;
    role?: UserRole;
    action: string;
    entity?: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    browser?: string;
    status?: ActivityStatus;
    metadata?: Record<string, unknown>;
}
export declare class ActivityLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(input: LogActivityInput): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole | null;
        createdAt: Date;
        userId: string | null;
        status: import(".prisma/client").$Enums.ActivityStatus;
        metadata: Prisma.JsonValue | null;
        action: string;
        entity: string | null;
        entityId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        browser: string | null;
    }>;
    findMany(options: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
        status?: ActivityStatus;
    }): Promise<{
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
            metadata: Prisma.JsonValue | null;
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
    private parseBrowser;
}
