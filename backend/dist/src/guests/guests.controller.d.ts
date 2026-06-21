import { GuestsService } from './guests.service';
export declare class GuestsController {
    private guestsService;
    constructor(guestsService: GuestsService);
    findAll(page?: string, limit?: string): Promise<{
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
        bookings: ({
            items: ({
                roomType: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    type: string;
                    description: string | null;
                    businessId: string;
                    basePrice: import("@prisma/client/runtime/library").Decimal;
                    size: string;
                    maxGuests: number;
                    beds: number;
                    amenities: string[];
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
            currency: import(".prisma/client").$Enums.SupportedCurrency;
            businessId: string;
            bookingNumber: string;
            bookingType: import(".prisma/client").$Enums.BookingType;
            checkInDate: Date;
            checkOutDate: Date;
            specialRequests: string | null;
            promoCodeId: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            depositAmount: import("@prisma/client/runtime/library").Decimal | null;
            paidAmount: import("@prisma/client/runtime/library").Decimal;
            guestEmail: string;
            guestFirstName: string;
            guestLastName: string;
            guestPhone: string | null;
            groupSize: number;
            recurringRule: import("@prisma/client/runtime/library").JsonValue | null;
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
}
