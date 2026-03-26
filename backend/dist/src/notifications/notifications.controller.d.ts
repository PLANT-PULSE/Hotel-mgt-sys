import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notifications;
    constructor(notifications: NotificationsService);
    list(bookingId?: string): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        type: string;
        bookingId: string | null;
        title: string;
        message: string;
        sentAt: Date | null;
    }[]>;
}
