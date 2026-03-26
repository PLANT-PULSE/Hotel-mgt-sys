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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const [monthlyRevenue, totalBookings, totalRooms, roomStatusCounts, totalGuests, totalRevenue] = await Promise.all([
            this.prisma.payment.aggregate({
                where: {
                    status: client_1.PaymentStatus.COMPLETED,
                    paidAt: { gte: startOfMonth, lte: endOfMonth },
                },
                _sum: { amount: true },
            }),
            this.prisma.booking.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
            this.prisma.room.count(),
            this.prisma.room.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            this.prisma.guest.count(),
            this.prisma.payment.aggregate({
                where: { status: client_1.PaymentStatus.COMPLETED },
                _sum: { amount: true },
            }),
        ]);
        const statusMap = Object.fromEntries(roomStatusCounts.map((s) => [s.status, s._count.id]));
        const occupied = statusMap[client_1.RoomStatus.OCCUPIED] ?? 0;
        const occupancyRate = totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;
        return {
            monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
            totalRevenue: Number(totalRevenue._sum.amount ?? 0),
            totalBookings: totalBookings,
            occupancyRate: Math.round(occupancyRate * 10) / 10,
            totalCustomers: totalGuests,
            totalRooms,
            roomStatus: {
                available: statusMap[client_1.RoomStatus.AVAILABLE] ?? 0,
                occupied: statusMap[client_1.RoomStatus.OCCUPIED] ?? 0,
                cleaning: statusMap[client_1.RoomStatus.CLEANING] ?? 0,
                maintenance: statusMap[client_1.RoomStatus.MAINTENANCE] ?? 0,
            },
        };
    }
    async getRevenueOverview(months = 6) {
        const result = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            const sum = await this.prisma.payment.aggregate({
                where: {
                    status: client_1.PaymentStatus.COMPLETED,
                    paidAt: { gte: start, lte: end },
                },
                _sum: { amount: true },
            });
            result.push({
                month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
                revenue: Number(sum._sum.amount ?? 0),
            });
        }
        return result;
    }
    async getRecentBookings(limit = 10) {
        return this.prisma.booking.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                items: { include: { roomType: true } },
                guest: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
            },
        });
    }
    async getBookingTrends(days = 30) {
        const start = new Date();
        start.setDate(start.getDate() - days);
        const bookings = await this.prisma.booking.groupBy({
            by: ['status'],
            where: { createdAt: { gte: start } },
            _count: { id: true },
        });
        return Object.fromEntries(bookings.map((b) => [b.status, b._count.id]));
    }
    async getCalendarOccupancy(months = 12) {
        const result = [];
        const now = new Date();
        const totalRooms = await this.prisma.room.count();
        for (let i = 0; i < months; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const start = new Date(d);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            const bookingsInMonth = await this.prisma.booking.findMany({
                where: {
                    status: client_1.BookingStatus.CONFIRMED,
                    checkInDate: { lte: end },
                    checkOutDate: { gte: start },
                },
                include: { items: true },
            });
            let bookedRoomNights = 0;
            const daysInMonth = end.getDate();
            for (const booking of bookingsInMonth) {
                const bookingStart = new Date(booking.checkInDate);
                const bookingEnd = new Date(booking.checkOutDate);
                const overlapStart = start > bookingStart ? start : bookingStart;
                const overlapEnd = end < bookingEnd ? end : bookingEnd;
                const overlappingDays = Math.max(0, Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)));
                bookedRoomNights += overlappingDays * booking.items.reduce((sum, item) => sum + item.quantity, 0);
            }
            const totalRoomNights = totalRooms * daysInMonth;
            const occupancyRate = totalRoomNights > 0 ? (bookedRoomNights / totalRoomNights) * 100 : 0;
            result.push({
                month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
                occupancyRate: Math.round(occupancyRate * 10) / 10,
                bookedRooms: bookingsInMonth.length,
                totalRooms,
            });
        }
        return result;
    }
    async getRoomBookingsCalendar(roomId, startDate, endDate) {
        const now = new Date();
        const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
        const end = endDate || new Date(now.getFullYear(), now.getMonth() + 3, 0, 23, 59, 59);
        const rooms = await this.prisma.room.findMany({
            where: roomId ? { id: roomId } : undefined,
            include: {
                roomType: {
                    include: {
                        bookingItems: {
                            where: {
                                booking: {
                                    status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.PENDING] },
                                    checkInDate: { lte: end },
                                    checkOutDate: { gte: start },
                                },
                            },
                            include: {
                                booking: {
                                    select: {
                                        id: true,
                                        bookingNumber: true,
                                        guestFirstName: true,
                                        guestLastName: true,
                                        checkInDate: true,
                                        checkOutDate: true,
                                        status: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return rooms.map(room => ({
            id: room.id,
            number: room.number,
            roomType: room.roomType.name,
            status: room.status,
            bookings: room.roomType.bookingItems
                .filter(item => item.booking)
                .map(item => ({
                id: item.booking.id,
                bookingNumber: item.booking.bookingNumber,
                guestName: `${item.booking.guestFirstName} ${item.booking.guestLastName}`,
                checkIn: item.booking.checkInDate,
                checkOut: item.booking.checkOutDate,
                status: item.booking.status,
            })),
        }));
    }
    async getDailyBookings(days = 30) {
        const start = new Date();
        start.setDate(start.getDate() - days);
        const bookings = await this.prisma.booking.findMany({
            where: { createdAt: { gte: start } },
            select: { createdAt: true, id: true },
        });
        const dailyMap = new Map();
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().split('T')[0];
            dailyMap.set(key, 0);
        }
        bookings.forEach(b => {
            const key = b.createdAt.toISOString().split('T')[0];
            dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
        });
        return Array.from(dailyMap.entries()).map(([date, count]) => ({
            date,
            count,
        }));
    }
    async getMostBookedRooms(limit = 5) {
        const bookings = await this.prisma.booking.findMany({
            where: {
                status: client_1.BookingStatus.CONFIRMED,
            },
            include: {
                items: { include: { roomType: true } },
            },
        });
        const roomTypeCounts = new Map();
        bookings.forEach(booking => {
            booking.items.forEach(item => {
                const current = roomTypeCounts.get(item.roomTypeId) || { name: item.roomType.name, count: 0 };
                current.count += item.quantity;
                roomTypeCounts.set(item.roomTypeId, current);
            });
        });
        return Array.from(roomTypeCounts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    async getBookingStatusBreakdown() {
        const statuses = await this.prisma.booking.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        return Object.fromEntries(statuses.map(s => [s.status, s._count.id]));
    }
    async blockDates(roomId, startDate, endDate, reason) {
        return this.prisma.blockedDate.create({
            data: {
                roomId,
                startDate,
                endDate,
                reason,
            },
        });
    }
    async getBlockedDates(roomId) {
        return this.prisma.blockedDate.findMany({
            where: roomId ? { roomId } : undefined,
            include: { room: true },
        });
    }
    async deleteBlockedDate(id) {
        return this.prisma.blockedDate.delete({ where: { id } });
    }
    async getRevenueByRoomType() {
        const bookings = await this.prisma.booking.findMany({
            where: { status: client_1.BookingStatus.CONFIRMED },
            include: {
                items: { include: { roomType: true } },
            },
        });
        const revenueByType = new Map();
        bookings.forEach(booking => {
            booking.items.forEach(item => {
                const current = revenueByType.get(item.roomTypeId) || { name: item.roomType.name, revenue: 0 };
                current.revenue += Number(item.totalPrice);
                revenueByType.set(item.roomTypeId, current);
            });
        });
        return Array.from(revenueByType.values())
            .sort((a, b) => b.revenue - a.revenue);
    }
    async getGuestStats() {
        const [totalGuests, newGuestsThisMonth, guestsWithBookings] = await Promise.all([
            this.prisma.guest.count(),
            this.prisma.guest.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            this.prisma.guest.count({
                where: {
                    bookings: { some: {} },
                },
            }),
        ]);
        return {
            totalGuests,
            newGuestsThisMonth,
            guestsWithBookings,
            returnGuests: guestsWithBookings,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map