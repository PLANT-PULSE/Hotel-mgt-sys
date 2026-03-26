import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
export declare class ReservationLockService {
    private prisma;
    private events;
    private static readonly LOCK_DURATION_MINUTES;
    constructor(prisma: PrismaService, events: EventsGateway);
    createLock(roomTypeId: string, checkInDate: Date, checkOutDate: Date, quantity?: number): Promise<{
        sessionToken: string;
        expiresAt: Date;
    }>;
    validateLock(sessionToken: string): Promise<boolean>;
    getLock(sessionToken: string): Promise<({
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
    private getMaxBlockedUnitsInRange;
    checkAvailability(roomTypeId: string, checkInDate: Date, checkOutDate: Date, excludeSessionToken?: string): Promise<{
        available: boolean;
        availableQuantity: number;
        lockedQuantity: number;
        blockedQuantity: number;
        bookedQuantity: number;
    }>;
    getAvailableDates(roomTypeId: string, startDate: Date, endDate: Date): Promise<{
        date: string;
        available: number;
    }[]>;
    cleanupExpiredLocks(): Promise<number>;
}
