import { CalendarService } from './calendar.service';
export declare class CalendarController {
    private calendar;
    constructor(calendar: CalendarService);
    getAvailability(roomTypeId: string, startDate: string, endDate: string): Promise<{
        date: string;
        status: import("./calendar.service").CalendarAvailabilityStatus;
        availableRooms: number;
        totalRooms: number;
    }[]>;
}
