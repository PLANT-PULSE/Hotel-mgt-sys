import { PrismaService } from '../prisma/prisma.service';
export type NotificationType = 'bookingConfirmation' | 'reminder' | 'paymentReceipt' | 'cancellation';
export interface CreateNotificationInput {
    bookingId?: string;
    type: NotificationType;
    title: string;
    message: string;
    email?: string;
}
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateNotificationInput): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        type: string;
        bookingId: string | null;
        title: string;
        message: string;
        sentAt: Date | null;
    }>;
    sendBookingConfirmation(bookingId: string, email: string): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        type: string;
        bookingId: string | null;
        title: string;
        message: string;
        sentAt: Date | null;
    } | null>;
    sendPaymentReceipt(bookingId: string, email: string, amount: number): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        type: string;
        bookingId: string | null;
        title: string;
        message: string;
        sentAt: Date | null;
    }>;
    getByBookingId(bookingId: string): Promise<{
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
