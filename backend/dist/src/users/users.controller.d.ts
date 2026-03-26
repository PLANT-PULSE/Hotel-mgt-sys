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
            employeeId: string;
            department: string;
            hireDate: Date;
        } | null;
    } | null>;
}
