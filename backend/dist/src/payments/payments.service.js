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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: { payments: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const paidTotal = booking.payments
            .filter((p) => p.status === client_1.PaymentStatus.COMPLETED)
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Number(booking.totalAmount) - paidTotal;
        if (dto.amount > remaining) {
            throw new common_1.BadRequestException(`Amount exceeds remaining balance ($${remaining})`);
        }
        const payment = await this.prisma.payment.create({
            data: {
                bookingId: dto.bookingId,
                amount: dto.amount,
                method: dto.method,
                transactionId: dto.transactionId,
                metadata: dto.metadata,
                status: dto.transactionId ? client_1.PaymentStatus.COMPLETED : client_1.PaymentStatus.PENDING,
                paidAt: dto.transactionId ? new Date() : null,
            },
        });
        const newPaidTotal = paidTotal + dto.amount;
        if (Math.abs(newPaidTotal - Number(booking.totalAmount)) < 0.01) {
            await this.prisma.booking.update({
                where: { id: dto.bookingId },
                data: { status: 'CONFIRMED' },
            });
        }
        return payment;
    }
    async findById(id) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: { booking: true },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return payment;
    }
    async findByBookingId(bookingId) {
        return this.prisma.payment.findMany({
            where: { bookingId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, status, transactionId) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return this.prisma.payment.update({
            where: { id },
            data: {
                status,
                transactionId: transactionId ?? payment.transactionId,
                paidAt: status === client_1.PaymentStatus.COMPLETED ? new Date() : payment.paidAt,
            },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map