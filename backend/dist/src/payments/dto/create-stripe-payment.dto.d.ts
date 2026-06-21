export declare class CreateStripePaymentIntentDto {
    bookingId: string;
    amount?: number;
    currency?: string;
}
export declare class ConfirmPaymentDto {
    paymentIntentId: string;
}
