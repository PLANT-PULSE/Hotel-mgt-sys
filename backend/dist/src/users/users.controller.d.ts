import { UsersService } from './users.service';
import { RequestUser } from '../auth/strategies/jwt.strategy';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(user: RequestUser): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        preferredLanguage: import(".prisma/client").$Enums.SupportedLanguage;
        preferredCurrency: import(".prisma/client").$Enums.SupportedCurrency;
        avatar: string | null;
        createdAt: Date;
        guestProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            loyaltyPoints: number;
            loyaltyTier: string;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        staffProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            businessId: string;
            department: string;
            employeeId: string;
            hireDate: Date;
        } | null;
    } | null>;
}
