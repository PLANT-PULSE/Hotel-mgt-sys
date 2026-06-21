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
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const ACTIVE_BOOKING_STATUSES = [
    client_1.BookingStatus.PENDING,
    client_1.BookingStatus.CONFIRMED,
    client_1.BookingStatus.CHECKED_IN,
];
let ReservationLockService = ReservationLockService_1 = class ReservationLockService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    overlapFilter(checkInDate, checkOutDate) {
        return {
            checkInDate: { lt: checkOutDate },
            checkOutDate: { gt: checkInDate },
        };
    }
    async createLock(roomTypeId, checkInDate, checkOutDate, quantity = 1) {
        if (checkOutDate <= checkInDate) {
            throw new common_1.BadRequestException('Check-out must be after check-in');
        }
        const availability = await this.checkAvailability(roomTypeId, checkInDate, checkOutDate);
        if (!availability.available || availability.availableQuantity < quantity) {
            throw new common_1.BadRequestException(`Not enough rooms available. Only ${availability.availableQuantity} room(s) left for these dates.`);
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
        return true;
    }
    async releaseLock(sessionToken) {
        await this.prisma.reservationLock.delete({
            where: { sessionToken },
        }).catch(() => undefined);
    }
    async checkAvailability(roomTypeId, checkInDate, checkOutDate, tx, excludeSessionToken) {
        const db = this.client(tx);
        const roomType = await db.roomType.findUnique({
            where: { id: roomTypeId },
        });
        if (!roomType) {
            return { available: false, availableQuantity: 0, lockedQuantity: 0 };
        }
        const totalCapacity = await db.room.count({
            where: {
                roomTypeId,
                status: { not: client_1.RoomStatus.MAINTENANCE },
            },
        });
        const capacity = totalCapacity > 0 ? totalCapacity : roomType.totalUnits;
        const overlappingBookings = await db.booking.findMany({
            where: {
                status: { in: ACTIVE_BOOKING_STATUSES },
                items: { some: { roomTypeId } },
                ...this.overlapFilter(checkInDate, checkOutDate),
            },
            include: { items: { where: { roomTypeId } } },
        });
        let bookedQuantity = 0;
        for (const booking of overlappingBookings) {
            for (const item of booking.items) {
                bookedQuantity += item.quantity;
            }
        }
        const activeLocks = await db.reservationLock.findMany({
            where: {
                roomTypeId,
                expiresAt: { gt: new Date() },
                ...(excludeSessionToken ? { sessionToken: { not: excludeSessionToken } } : {}),
                ...this.overlapFilter(checkInDate, checkOutDate),
            },
        });
        const lockedQuantity = activeLocks.reduce((sum, lock) => sum + lock.quantity, 0);
        const availableQuantity = Math.max(0, capacity - bookedQuantity - lockedQuantity);
        return {
            available: availableQuantity > 0,
            availableQuantity,
            lockedQuantity,
        };
    }
    async assertItemsAvailable(items, checkInDate, checkOutDate, tx, excludeSessionToken) {
        for (const item of items) {
            const availability = await this.checkAvailability(item.roomTypeId, checkInDate, checkOutDate, tx, excludeSessionToken);
            if (availability.availableQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Not enough rooms available for the selected dates. Only ${availability.availableQuantity} room(s) left.`);
            }
        }
    }
    async getAvailableDates(roomTypeId, startDate, endDate) {
        const dates = [];
        const roomType = await this.prisma.roomType.findUnique({
            where: { id: roomTypeId },
        });
        if (!roomType) {
            return dates;
        }
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const availability = await this.checkAvailability(roomTypeId, currentDate, nextDay);
            dates.push({
                date: currentDate.toISOString().split('T')[0],
                available: availability.availableQuantity,
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationLockService);
//# sourceMappingURL=reservation-lock.service.js.map