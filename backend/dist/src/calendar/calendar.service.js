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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CalendarService = class CalendarService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAvailability(input) {
        const { roomTypeId, startDate, endDate } = input;
        if (endDate < startDate)
            throw new common_1.BadRequestException('endDate must be >= startDate');
        const roomType = await this.prisma.roomType.findUnique({
            where: { id: roomTypeId },
            select: { totalUnits: true },
        });
        if (!roomType)
            throw new common_1.BadRequestException('Invalid roomTypeId');
        const totalRooms = roomType.totalUnits;
        const rooms = await this.prisma.room.findMany({
            where: { roomTypeId },
            select: { id: true },
        });
        const roomIds = rooms.map((r) => r.id);
        const [bookings, locks, blocks] = await Promise.all([
            this.prisma.booking.findMany({
                where: {
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    items: { some: { roomTypeId } },
                    checkInDate: { lt: endDate },
                    checkOutDate: { gt: startDate },
                },
                include: { items: { where: { roomTypeId } } },
            }),
            this.prisma.reservationLock.findMany({
                where: {
                    roomTypeId,
                    expiresAt: { gt: new Date() },
                    checkInDate: { lt: endDate },
                    checkOutDate: { gt: startDate },
                },
                select: { checkInDate: true, checkOutDate: true, quantity: true },
            }),
            roomIds.length
                ? this.prisma.blockedDate.findMany({
                    where: {
                        roomId: { in: roomIds },
                        startDate: { lt: endDate },
                        endDate: { gt: startDate },
                    },
                    select: { roomId: true, startDate: true, endDate: true },
                })
                : Promise.resolve([]),
        ]);
        const out = [];
        const d = new Date(startDate);
        while (d <= endDate) {
            const day = new Date(d);
            const dateStr = day.toISOString().split('T')[0];
            let bookedRooms = 0;
            for (const b of bookings) {
                if (b.checkInDate <= day && b.checkOutDate > day) {
                    for (const item of b.items)
                        bookedRooms += item.quantity;
                }
            }
            let lockedRooms = 0;
            for (const l of locks) {
                if (l.checkInDate <= day && l.checkOutDate > day)
                    lockedRooms += l.quantity;
            }
            let blockedRooms = 0;
            if (blocks.length) {
                const blockedSet = new Set();
                for (const b of blocks) {
                    if (b.startDate <= day && b.endDate > day)
                        blockedSet.add(b.roomId);
                }
                blockedRooms = blockedSet.size;
            }
            const availableRooms = Math.max(0, totalRooms - bookedRooms - lockedRooms - blockedRooms);
            const status = blockedRooms >= totalRooms
                ? 'BLOCKED'
                : availableRooms <= 0
                    ? 'FULLY_BOOKED'
                    : availableRooms < totalRooms
                        ? 'PARTIALLY_AVAILABLE'
                        : 'AVAILABLE';
            out.push({ date: dateStr, status, availableRooms, totalRooms });
            d.setDate(d.getDate() + 1);
        }
        return out;
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map