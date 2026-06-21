import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
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
    getRevenue(months?: string): Promise<{
        month: string;
        revenue: number;
    }[]>;
    getRecentBookings(limit?: string): Promise<({
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
    })[]>;
    getTrends(days?: string): Promise<{
        [k: string]: number;
    }>;
    getCalendarOccupancy(months?: string): Promise<{
        month: string;
        occupancyRate: number;
        bookedRooms: number;
        totalRooms: number;
    }[]>;
    getRoomBookingsCalendar(roomId?: string, startDate?: string, endDate?: string): Promise<{
        id: string;
        roomNumber: string;
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
    getDailyBookings(days?: string): Promise<{
        date: string;
        count: number;
    }[]>;
    getMostBookedRooms(limit?: string): Promise<{
        name: string;
        count: number;
    }[]>;
    getBookingStatusBreakdown(): Promise<{
        [k: string]: number;
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
    blockDates(dto: {
        roomId: string;
        startDate: string;
        endDate: string;
        reason?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        reason: string | null;
        startDate: Date;
        endDate: Date;
        roomId: string;
    }>;
    getBlockedDates(roomId?: string): Promise<({
        room: {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.RoomStatus;
            roomTypeId: string;
            floor: number;
        };
    } & {
        id: string;
        createdAt: Date;
        reason: string | null;
        startDate: Date;
        endDate: Date;
        roomId: string;
    })[]>;
    deleteBlockedDate(id: string): Promise<{
        id: string;
        createdAt: Date;
        reason: string | null;
        startDate: Date;
        endDate: Date;
        roomId: string;
    }>;
}
