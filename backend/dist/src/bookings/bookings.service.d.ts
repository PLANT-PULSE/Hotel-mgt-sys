import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, Prisma } from '@prisma/client';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { ReservationLockService } from './reservation-lock.service';
export declare class BookingsService {
    private prisma;
    private reservationLockService;
    constructor(prisma: PrismaService, reservationLockService: ReservationLockService);
    private generateBookingNumber;
    private calculateTotal;
    create(dto: CreateBookingDto, user?: RequestUser): Promise<({
        items: ({
            roomType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: string;
                basePrice: Prisma.Decimal;
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
            pricePerNight: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
            bookingId: string;
        })[];
        addOns: ({
            addOn: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                key: string;
                price: Prisma.Decimal;
            };
        } & {
            id: string;
            price: Prisma.Decimal;
            quantity: number;
            bookingId: string;
            addOnId: string;
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
        totalAmount: Prisma.Decimal;
        currency: string;
        guestEmail: string;
        guestFirstName: string;
        guestLastName: string;
        guestPhone: string | null;
        guestId: string | null;
        createdById: string | null;
    }) | null>;
    findMyBookings(userId: string): Promise<{
        data: ({
            guest: ({
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                loyaltyPoints: number;
                loyaltyTier: string;
                preferences: Prisma.JsonValue | null;
            }) | null;
            items: ({
                roomType: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    type: string;
                    basePrice: Prisma.Decimal;
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
                pricePerNight: Prisma.Decimal;
                totalPrice: Prisma.Decimal;
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
            totalAmount: Prisma.Decimal;
            currency: string;
            guestEmail: string;
            guestFirstName: string;
            guestLastName: string;
            guestPhone: string | null;
            guestId: string | null;
            createdById: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    findAll(filters?: {
        status?: BookingStatus;
        guestId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            guest: ({
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                loyaltyPoints: number;
                loyaltyTier: string;
                preferences: Prisma.JsonValue | null;
            }) | null;
            items: ({
                roomType: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    type: string;
                    basePrice: Prisma.Decimal;
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
                pricePerNight: Prisma.Decimal;
                totalPrice: Prisma.Decimal;
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
            totalAmount: Prisma.Decimal;
            currency: string;
            guestEmail: string;
            guestFirstName: string;
            guestLastName: string;
            guestPhone: string | null;
            guestId: string | null;
            createdById: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    findByNumber(bookingNumber: string): Promise<{
        items: ({
            roomType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: string;
                basePrice: Prisma.Decimal;
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
            pricePerNight: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
            bookingId: string;
        })[];
        addOns: ({
            addOn: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                key: string;
                price: Prisma.Decimal;
            };
        } & {
            id: string;
            price: Prisma.Decimal;
            quantity: number;
            bookingId: string;
            addOnId: string;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            currency: string;
            bookingId: string;
            amount: Prisma.Decimal;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            stripePaymentIntentId: string | null;
            stripeCustomerId: string | null;
            stripePaymentMethodId: string | null;
            clientSecret: string | null;
            metadata: Prisma.JsonValue | null;
            paidAt: Date | null;
        }[];
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
        totalAmount: Prisma.Decimal;
        currency: string;
        guestEmail: string;
        guestFirstName: string;
        guestLastName: string;
        guestPhone: string | null;
        guestId: string | null;
        createdById: string | null;
    }>;
    findById(id: string): Promise<{
        guest: ({
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
            preferences: Prisma.JsonValue | null;
        }) | null;
        items: ({
            roomType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: string;
                basePrice: Prisma.Decimal;
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
            pricePerNight: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
            bookingId: string;
        })[];
        addOns: ({
            addOn: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                key: string;
                price: Prisma.Decimal;
            };
        } & {
            id: string;
            price: Prisma.Decimal;
            quantity: number;
            bookingId: string;
            addOnId: string;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            currency: string;
            bookingId: string;
            amount: Prisma.Decimal;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            stripePaymentIntentId: string | null;
            stripeCustomerId: string | null;
            stripePaymentMethodId: string | null;
            clientSecret: string | null;
            metadata: Prisma.JsonValue | null;
            paidAt: Date | null;
        }[];
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
        totalAmount: Prisma.Decimal;
        currency: string;
        guestEmail: string;
        guestFirstName: string;
        guestLastName: string;
        guestPhone: string | null;
        guestId: string | null;
        createdById: string | null;
    }>;
    updateStatus(id: string, status: BookingStatus): Promise<{
        items: ({
            roomType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: string;
                basePrice: Prisma.Decimal;
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
            pricePerNight: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
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
        totalAmount: Prisma.Decimal;
        currency: string;
        guestEmail: string;
        guestFirstName: string;
        guestLastName: string;
        guestPhone: string | null;
        guestId: string | null;
        createdById: string | null;
    }>;
}
