import { PrismaService } from '../prisma/prisma.service';
export declare class GuestsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            loyaltyPoints: number;
            loyaltyTier: string;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
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
        bookings: ({
            items: ({
                roomType: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    type: string;
                    basePrice: import("@prisma/client/runtime/library").Decimal;
                    size: string;
                    maxGuests: number;
                    beds: number;
                    amenities: string[];
                    description: string | null;
                    image: string | null;
                    totalUnits: number;
                };
            } & {
                id: string;
                roomTypeId: string;
                quantity: number;
                pricePerNight: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
                bookingId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            bookingNumber: string;
            checkInDate: Date;
            checkOutDate: Date;
            specialRequests: string | null;
            promoCodeId: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            guestEmail: string;
            guestFirstName: string;
            guestLastName: string;
            guestPhone: string | null;
            guestId: string | null;
            createdById: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        loyaltyPoints: number;
        loyaltyTier: string;
        preferences: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findByUserId(userId: string): Promise<{
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
        loyaltyPoints: number;
        loyaltyTier: string;
        preferences: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateLoyaltyPoints(id: string, points: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        loyaltyPoints: number;
        loyaltyTier: string;
        preferences: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
