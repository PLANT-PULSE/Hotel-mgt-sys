import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        monthlyRevenue: number;
        totalRevenue: number;
        totalBookings: number;
        occupancyRate: number;
        totalCustomers: number;
        totalRooms: number;
        roomStatus: {
            available: number;
            occupied: number;
            cleaning: number;
            maintenance: number;
        };
    }>;
    getRevenueOverview(months?: number): Promise<{
        month: string;
        revenue: number;
    }[]>;
    getRecentBookings(limit?: number): Promise<({
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
    })[]>;
    getBookingTrends(days?: number): Promise<{
        [k: string]: number;
    }>;
    getCalendarOccupancy(months?: number): Promise<{
        month: string;
        occupancyRate: number;
        bookedRooms: number;
        totalRooms: number;
    }[]>;
    getRoomBookingsCalendar(roomId?: string, startDate?: Date, endDate?: Date): Promise<{
        id: string;
        number: string;
        roomType: string;
        status: import(".prisma/client").$Enums.RoomStatus;
        bookings: {
            id: string;
            bookingNumber: string;
            guestName: string;
            checkIn: Date;
            checkOut: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
        }[];
    }[]>;
    getDailyBookings(days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    getMostBookedRooms(limit?: number): Promise<{
        name: string;
        count: number;
    }[]>;
    getBookingStatusBreakdown(): Promise<{
        [k: string]: number;
    }>;
    blockDates(roomId: string, startDate: Date, endDate: Date, reason?: string): Promise<{
        id: string;
        createdAt: Date;
        roomId: string;
        startDate: Date;
        endDate: Date;
        reason: string | null;
    }>;
    getBlockedDates(roomId?: string): Promise<({
        room: {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            floor: number;
            status: import(".prisma/client").$Enums.RoomStatus;
        };
    } & {
        id: string;
        createdAt: Date;
        roomId: string;
        startDate: Date;
        endDate: Date;
        reason: string | null;
    })[]>;
    deleteBlockedDate(id: string): Promise<{
        id: string;
        createdAt: Date;
        roomId: string;
        startDate: Date;
        endDate: Date;
        reason: string | null;
    }>;
    getRevenueByRoomType(): Promise<{
        name: string;
        revenue: number;
    }[]>;
    getGuestStats(): Promise<{
        totalGuests: number;
        newGuestsThisMonth: number;
        guestsWithBookings: number;
        returnGuests: number;
    }>;
}
