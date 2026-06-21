"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let StripeService = class StripeService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.stripe = null;
        const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (stripeSecretKey) {
            this.stripe = new stripe_1.default(stripeSecretKey, {
                apiVersion: '2026-02-25.clover',
            });
        }
        this.webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || '';
    }
    getStripeClient() {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe is not configured');
        }
        return this.stripe;
    }
    async createPaymentIntent(bookingId, amount, currency = 'usd') {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { payments: true },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const paidTotal = booking.payments
            .filter((p) => p.status === client_1.PaymentStatus.COMPLETED)
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Number(booking.totalAmount) - paidTotal;
        const paymentAmount = amount || remaining;
        if (paymentAmount <= 0) {
            throw new common_1.BadRequestException('Booking is already fully paid');
        }
        const paymentIntent = await this.getStripeClient().paymentIntents.create({
            amount: Math.round(paymentAmount * 100),
            currency: currency.toLowerCase(),
            metadata: {
                bookingId: booking.id,
                bookingNumber: booking.bookingNumber,
            },
            description: `Hotel Booking ${booking.bookingNumber}`,
        });
        const payment = await this.prisma.payment.create({
            data: {
                bookingId: booking.id,
                amount: paymentAmount,
                currency: currency.toUpperCase(),
                method: 'CARD',
                status: client_1.PaymentStatus.PENDING,
                stripePaymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
            },
        });
        return {
            paymentId: payment.id,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentAmount,
            currency: currency.toUpperCase(),
        };
    }
    async confirmPayment(paymentIntentId) {
        const payment = await this.prisma.payment.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
            include: { booking: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found for this payment intent');
        }
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.COMPLETED,
                paidAt: new Date(),
            },
        });
        const allPayments = await this.prisma.payment.findMany({
            where: { bookingId: payment.bookingId },
        });
        const paidTotal = allPayments
            .filter((p) => p.status === client_1.PaymentStatus.COMPLETED)
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const totalAmount = Number(payment.booking.totalAmount);
        if (paidTotal >= totalAmount - 0.01) {
            await this.prisma.booking.update({
                where: { id: payment.bookingId },
                data: { status: 'CONFIRMED' },
            });
        }
        return { success: true, bookingId: payment.bookingId };
    }
    async handlePaymentFailure(paymentIntentId) {
        const payment = await this.prisma.payment.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
        });
        if (payment) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: client_1.PaymentStatus.FAILED },
            });
        }
        return { success: true };
    }
    async getPayment(id) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: { booking: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async getPaymentIntentStatus(paymentIntentId) {
        try {
            const paymentIntent = await this.getStripeClient().paymentIntents.retrieve(paymentIntentId);
            return {
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('Payment intent not found');
        }
    }
    async processWebhook(payload, signature) {
        let event;
        try {
            if (this.webhookSecret) {
                event = this.getStripeClient().webhooks.constructEvent(payload, signature, this.webhookSecret);
            }
            else {
                event = JSON.parse(payload.toString());
            }
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook signature verification failed`);
        }
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                await this.confirmPayment(paymentIntent.id);
                break;
            case 'payment_intent.payment_failed':
                const failedPaymentIntent = event.data.object;
                await this.handlePaymentFailure(failedPaymentIntent.id);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }
    async createOrGetCustomer(email, name) {
        const customers = await this.getStripeClient().customers.list({
            email,
            limit: 1,
        });
        if (customers.data.length > 0) {
            return customers.data[0];
        }
        return this.getStripeClient().customers.create({
            email,
            name,
        });
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map