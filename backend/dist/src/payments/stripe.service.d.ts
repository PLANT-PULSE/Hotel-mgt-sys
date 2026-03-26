import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
export declare class StripeService {
    private prisma;
    private configService;
    private stripe;
    private webhookSecret;
    constructor(prisma: PrismaService, configService: ConfigService);
    createPaymentIntent(bookingId: string, amount: number, currency?: string): Promise<{
        paymentId: string;
        clientSecret: string | null;
        paymentIntentId: string;
        amount: number;
        currency: string;
    }>;
    confirmPayment(paymentIntentId: string): Promise<{
        success: boolean;
        bookingId: string;
    }>;
    handlePaymentFailure(paymentIntentId: string): Promise<{
        success: boolean;
    }>;
    getPayment(id: string): Promise<{
        booking: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        bookingId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        method: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
        stripePaymentIntentId: string | null;
        stripeCustomerId: string | null;
        stripePaymentMethodId: string | null;
        clientSecret: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        paidAt: Date | null;
    }>;
    getPaymentIntentStatus(paymentIntentId: string): Promise<{
        status: Stripe.PaymentIntent.Status;
        amount: number;
        currency: string;
    }>;
    processWebhook(payload: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
    createOrGetCustomer(email: string, name: string): Promise<Stripe.Customer>;
}
