import { BookingsService } from './bookings.service';
import { ReservationLockService } from './reservation-lock.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateReservationLockDto } from './dto/create-reservation-lock.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { BookingStatus } from '@prisma/client';
export declare class BookingsController {
    private bookingsService;
    private reservationLockService;
    constructor(bookingsService: BookingsService, reservationLockService: ReservationLockService);
    checkAvailability(roomTypeId: string, checkInDate: string, checkOutDate: string): Promise<{
        available: boolean;
        availableQuantity: number;
        lockedQuantity: number;
    }>;
    createReservationLock(dto: CreateReservationLockDto): Promise<{
        sessionToken: string;
        expiresAt: Date;
    }>;
    releaseReservationLock(token: string): Promise<{
        message: string;
    }>;
    create(dto: CreateBookingDto, user?: RequestUser): Promise<({
        addOns: ({
            addOn: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                businessId: string;
                key: string;
                price: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            bookingId: string;
            addOnId: string;
        })[];
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
    }) | null>;
    findAll(status?: BookingStatus, page?: string, limit?: string): Promise<{
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
                preferences: import("@prisma/client/runtime/library").JsonValue | null;
            }) | null;
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
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getMyBookings(user: RequestUser): Promise<{
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
                preferences: import("@prisma/client/runtime/library").JsonValue | null;
            }) | null;
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
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    lookup(number: string): Promise<{
        addOns: ({
            addOn: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                businessId: string;
                key: string;
                price: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            bookingId: string;
            addOnId: string;
        })[];
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
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            currency: import(".prisma/client").$Enums.SupportedCurrency;
            amount: import("@prisma/client/runtime/library").Decimal;
            bookingId: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            isDeposit: boolean;
            isInstallment: boolean;
            installmentNumber: number | null;
            stripePaymentIntentId: string | null;
            stripeCustomerId: string | null;
            stripePaymentMethodId: string | null;
            clientSecret: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            paidAt: Date | null;
        }[];
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
    }>;
    findOne(id: string): Promise<{
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
            loyaltyPoints: number;
            loyaltyTier: string;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
        }) | null;
        addOns: ({
            addOn: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                businessId: string;
                key: string;
                price: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            bookingId: string;
            addOnId: string;
        })[];
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
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            currency: import(".prisma/client").$Enums.SupportedCurrency;
            amount: import("@prisma/client/runtime/library").Decimal;
            bookingId: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            isDeposit: boolean;
            isInstallment: boolean;
            installmentNumber: number | null;
            stripePaymentIntentId: string | null;
            stripeCustomerId: string | null;
            stripePaymentMethodId: string | null;
            clientSecret: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            paidAt: Date | null;
        }[];
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
    }>;
    updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<{
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
    }>;
}
