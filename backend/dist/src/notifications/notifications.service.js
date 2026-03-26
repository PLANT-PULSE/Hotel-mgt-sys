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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const notification = await this.prisma.notification.create({
            data: {
                bookingId: data.bookingId,
                type: data.type,
                title: data.title,
                message: data.message,
                email: data.email,
            },
        });
        return notification;
    }
    async sendBookingConfirmation(bookingId, email) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { items: { include: { roomType: true } } },
        });
        if (!booking)
            return null;
        return this.create({
            bookingId,
            type: 'bookingConfirmation',
            title: 'Booking Confirmed!',
            message: `Your booking #${booking.bookingNumber} has been confirmed.`,
            email,
        });
    }
    async sendPaymentReceipt(bookingId, email, amount) {
        return this.create({
            bookingId,
            type: 'paymentReceipt',
            title: 'Payment Received',
            message: `Payment of $${amount} received for your booking.`,
            email,
        });
    }
    async getByBookingId(bookingId) {
        return this.prisma.notification.findMany({
            where: { bookingId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async listLatest(limit = 100) {
        return this.prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: Math.min(Math.max(limit, 1), 500),
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map