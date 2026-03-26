import { PrismaService } from '../prisma/prisma.service';
export declare class StaffService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            employeeId: string;
            department: string;
            hireDate: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    findById(id: string): Promise<{
        user: {
            id: string;
            email: string;
            passwordHash: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            emailVerified: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        employeeId: string;
        department: string;
        hireDate: Date;
    }>;
}
