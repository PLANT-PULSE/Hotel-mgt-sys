import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ReservationLockService {
    private prisma;
    private static readonly LOCK_DURATION_MINUTES;
    constructor(prisma: PrismaService);
    private client;
    private overlapFilter;
    createLock(roomTypeId: string, checkInDate: Date, checkOutDate: Date, quantity?: number): Promise<{
        sessionToken: string;
        expiresAt: Date;
    }>;
    validateLock(sessionToken: string): Promise<boolean>;
    getLock(sessionToken: string): Promise<({
        roomType: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: string;
            description: string | null;
            businessId: string;
            basePrice: Prisma.Decimal;
            size: string;
            maxGuests: number;
            beds: number;
            amenities: string[];
            image: string | null;
            totalUnits: number;
        };
    } & {
        id: string;
        createdAt: Date;
        roomTypeId: string;
        checkInDate: Date;
        checkOutDate: Date;
        quantity: number;
        bookingId: string | null;
        expiresAt: Date;
        sessionToken: string;
    }) | null>;
    confirmBookingFromLock(sessionToken: string, bookingId: string): Promise<boolean>;
    releaseLock(sessionToken: string): Promise<void>;
    checkAvailability(roomTypeId: string, checkInDate: Date, checkOutDate: Date, tx?: Prisma.TransactionClient, excludeSessionToken?: string): Promise<{
        available: boolean;
        availableQuantity: number;
        lockedQuantity: number;
    }>;
    assertItemsAvailable(items: {
        roomTypeId: string;
        quantity: number;
    }[], checkInDate: Date, checkOutDate: Date, tx?: Prisma.TransactionClient, excludeSessionToken?: string): Promise<void>;
    getAvailableDates(roomTypeId: string, startDate: Date, endDate: Date): Promise<{
        date: string;
        available: number;
    }[]>;
    cleanupExpiredLocks(): Promise<number>;
}
