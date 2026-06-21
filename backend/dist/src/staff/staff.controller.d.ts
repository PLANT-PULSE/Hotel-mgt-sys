import { StaffService } from './staff.service';
export declare class StaffController {
    private staffService;
    constructor(staffService: StaffService);
    findAll(page?: string, limit?: string): Promise<{
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
            businessId: string;
            department: string;
            employeeId: string;
            hireDate: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    findOne(id: string): Promise<{
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
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            preferredLanguage: import(".prisma/client").$Enums.SupportedLanguage;
            preferredCurrency: import(".prisma/client").$Enums.SupportedCurrency;
            avatar: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        businessId: string;
        department: string;
        employeeId: string;
        hireDate: Date;
    }>;
}
