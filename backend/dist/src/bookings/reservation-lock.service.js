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
var ReservationLockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationLockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
const events_gateway_1 = require("../events/events.gateway");
let ReservationLockService = ReservationLockService_1 = class ReservationLockService {
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async createLock(roomTypeId, checkInDate, checkOutDate, quantity = 1) {
        const availability = await this.checkAvailability(roomTypeId, checkInDate, checkOutDate);
        if (!availability.available || availability.availableQuantity < quantity) {
            throw new common_1.BadRequestException(`Not enough rooms available. Only ${availability.availableQuantity} rooms left for these dates.`);
        }
        const sessionToken = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + ReservationLockService_1.LOCK_DURATION_MINUTES);
        await this.prisma.reservationLock.create({
            data: {
                roomTypeId,
                checkInDate,
                checkOutDate,
                quantity,
                sessionToken,
                expiresAt,
            },
        });
        this.events.broadcastReservationLock(roomTypeId, {
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            available: true,
            lockedQuantity: availability.lockedQuantity + quantity,
        });
        return { sessionToken, expiresAt };
    }
    async validateLock(sessionToken) {
        const lock = await this.prisma.reservationLock.findUnique({
            where: { sessionToken },
        });
        if (!lock) {
            return false;
        }
        if (new Date() > lock.expiresAt) {
            await this.prisma.reservationLock.delete({
                where: { sessionToken },
            });
            return false;
        }
        return true;
    }
    async getLock(sessionToken) {
        const lock = await this.prisma.reservationLock.findUnique({
            where: { sessionToken },
            include: { roomType: true },
        });
        if (!lock) {
            return null;
        }
        if (new Date() > lock.expiresAt) {
            await this.prisma.reservationLock.delete({
                where: { sessionToken },
            });
            return null;
        }
        return lock;
    }
    async confirmBookingFromLock(sessionToken, bookingId) {
        const lock = await this.prisma.reservationLock.findUnique({
            where: { sessionToken },
        });
        if (!lock) {
            return false;
        }
        await this.prisma.reservationLock.update({
            where: { sessionToken },
            data: { bookingId },
        });
        this.events.broadcastBookingConfirmed(bookingId, { sessionToken });
        return true;
    }
    async releaseLock(sessionToken) {
        const existing = await this.prisma.reservationLock.findUnique({
            where: { sessionToken },
        });
        await this.prisma.reservationLock
            .delete({
            where: { sessionToken },
        })
            .catch(() => {
        });
        if (existing) {
            this.events.broadcastReservationLock(existing.roomTypeId, {
                checkIn: existing.checkInDate.toISOString(),
                checkOut: existing.checkOutDate.toISOString(),
                available: true,
            });
        }
    }
    async getMaxBlockedUnitsInRange(roomTypeId, checkInDate, checkOutDate) {
        const rooms = await this.prisma.room.findMany({
            where: { roomTypeId },
            select: { id: true },
        });
        if (rooms.length === 0)
            return 0;
        const roomIds = rooms.map((r) => r.id);
        const blocks = await this.prisma.blockedDate.findMany({
            where: {
                roomId: { in: roomIds },
                startDate: { lt: checkOutDate },
                endDate: { gt: checkInDate },
            },
            select: { roomId: true, startDate: true, endDate: true },
        });
        if (blocks.length === 0)
            return 0;
        let maxBlocked = 0;
        const d = new Date(checkInDate);
        while (d < checkOutDate) {
            const blockedRooms = new Set();
            for (const b of blocks) {
                if (b.startDate <= d && b.endDate > d)
                    blockedRooms.add(b.roomId);
            }
            maxBlocked = Math.max(maxBlocked, blockedRooms.size);
            d.setDate(d.getDate() + 1);
        }
        return maxBlocked;
    }
    async checkAvailability(roomTypeId, checkInDate, checkOutDate, excludeSessionToken) {
        const roomType = await this.prisma.roomType.findUnique({
            where: { id: roomTypeId },
        });
        if (!roomType) {
            return {
                available: false,
                availableQuantity: 0,
                lockedQuantity: 0,
                blockedQuantity: 0,
                bookedQuantity: 0,
            };
        }
        const totalUnits = roomType.totalUnits;
        const confirmedBookings = await this.prisma.booking.findMany({
            where: {
                status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
                items: {
                    some: { roomTypeId },
                },
                OR: [
                    {
                        checkInDate: { lte: checkInDate },
                        checkOutDate: { gt: checkInDate },
                    },
                    {
                        checkInDate: { lt: checkOutDate },
                        checkOutDate: { gte: checkOutDate },
                    },
                    {
                        checkInDate: { gte: checkInDate },
                        checkOutDate: { lte: checkOutDate },
                    },
                ],
            },
            include: { items: { where: { roomTypeId } } },
        });
        let bookedQuantity = 0;
        for (const booking of confirmedBookings) {
            for (const item of booking.items) {
                bookedQuantity += item.quantity;
            }
        }
        const activeLocks = await this.prisma.reservationLock.findMany({
            where: {
                roomTypeId,
                expiresAt: { gt: new Date() },
                ...(excludeSessionToken ? { sessionToken: { not: excludeSessionToken } } : {}),
                OR: [
                    {
                        checkInDate: { lte: checkInDate },
                        checkOutDate: { gt: checkInDate },
                    },
                    {
                        checkInDate: { lt: checkOutDate },
                        checkOutDate: { gte: checkOutDate },
                    },
                    {
                        checkInDate: { gte: checkInDate },
                        checkOutDate: { lte: checkOutDate },
                    },
                ],
            },
        });
        const lockedQuantity = activeLocks.reduce((sum, lock) => sum + lock.quantity, 0);
        const blockedQuantity = await this.getMaxBlockedUnitsInRange(roomTypeId, checkInDate, checkOutDate);
        const availableQuantity = Math.max(0, totalUnits - bookedQuantity - lockedQuantity - blockedQuantity);
        return {
            available: availableQuantity > 0,
            availableQuantity,
            lockedQuantity,
            blockedQuantity,
            bookedQuantity,
        };
    }
    async getAvailableDates(roomTypeId, startDate, endDate) {
        const dates = [];
        const roomType = await this.prisma.roomType.findUnique({
            where: { id: roomTypeId },
        });
        if (!roomType) {
            return dates;
        }
        const totalUnits = roomType.totalUnits;
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const bookingsOnDate = await this.prisma.booking.findMany({
                where: {
                    status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
                    items: { some: { roomTypeId } },
                    checkInDate: { lte: currentDate },
                    checkOutDate: { gt: currentDate },
                },
                include: { items: { where: { roomTypeId } } },
            });
            let bookedOnDate = 0;
            for (const booking of bookingsOnDate) {
                for (const item of booking.items) {
                    bookedOnDate += item.quantity;
                }
            }
            const locksOnDate = await this.prisma.reservationLock.findMany({
                where: {
                    roomTypeId,
                    expiresAt: { gt: new Date() },
                    checkInDate: { lte: currentDate },
                    checkOutDate: { gt: currentDate },
                },
            });
            const lockedOnDate = locksOnDate.reduce((sum, lock) => sum + lock.quantity, 0);
            const blockedOnDate = await this.getMaxBlockedUnitsInRange(roomTypeId, currentDate, new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
            const availableOnDate = Math.max(0, totalUnits - bookedOnDate - lockedOnDate - blockedOnDate);
            dates.push({
                date: dateStr,
                available: availableOnDate,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    }
    async cleanupExpiredLocks() {
        const result = await this.prisma.reservationLock.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
        return result.count;
    }
};
exports.ReservationLockService = ReservationLockService;
ReservationLockService.LOCK_DURATION_MINUTES = 10;
exports.ReservationLockService = ReservationLockService = ReservationLockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], ReservationLockService);
//# sourceMappingURL=reservation-lock.service.js.map