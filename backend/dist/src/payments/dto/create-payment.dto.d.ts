import { PaymentMethod } from '@prisma/client';
export declare class CreatePaymentDto {
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    transactionId?: string;
    metadata?: Record<string, unknown>;
}
