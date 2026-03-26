import { PrismaService } from '../prisma/prisma.service';
export type CalendarAvailabilityStatus = 'FULLY_BOOKED' | 'PARTIALLY_AVAILABLE' | 'AVAILABLE' | 'BLOCKED';
export declare class CalendarService {
    private prisma;
    constructor(prisma: PrismaService);
    getAvailability(input: {
        roomTypeId: string;
        startDate: Date;
        endDate: Date;
    }): Promise<{
        date: string;
        status: CalendarAvailabilityStatus;
        availableRooms: number;
        totalRooms: number;
    }[]>;
}
