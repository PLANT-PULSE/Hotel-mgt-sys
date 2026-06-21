import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export interface CreateUserInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateUserInput): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    findByEmail(email: string): Promise<({
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
    } & {
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
    }) | null>;
    findById(id: string): Promise<{
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
    updateLastLogin(userId: string): Promise<void>;
}
