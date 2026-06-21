import { PaymentMethod } from '@prisma/client';
export declare class GuestCheckoutDto {
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    phoneNumber?: string;
    cardLast4?: string;
}
