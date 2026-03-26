import { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateStripePaymentIntentDto } from './dto/create-stripe-payment.dto';
import { PaymentStatus } from '@prisma/client';
import { Request } from 'express';
export declare class PaymentsController {
    private paymentsService;
    private stripeService;
    constructor(paymentsService: PaymentsService, stripeService: StripeService);
    create(dto: CreatePaymentDto): Promise<{
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
    createPaymentIntent(dto: CreateStripePaymentIntentDto): Promise<{
        paymentId: string;
        clientSecret: string | null;
        paymentIntentId: string;
        amount: number;
        currency: string;
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
        status: import("stripe").Stripe.PaymentIntent.Status;
        amount: number;
        currency: string;
    }>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    } | {
        received: boolean;
        error: string;
    }>;
    findByBooking(bookingId: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    updateStatus(id: string, body: {
        status: PaymentStatus;
        transactionId?: string;
    }): Promise<{
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
}
