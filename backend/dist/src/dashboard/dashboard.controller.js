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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getStats() {
        return this.dashboardService.getStats();
    }
    async getRevenue(months) {
        return this.dashboardService.getRevenueOverview(months ? parseInt(months) : 6);
    }
    async getRecentBookings(limit) {
        return this.dashboardService.getRecentBookings(limit ? parseInt(limit) : 10);
    }
    async getTrends(days) {
        return this.dashboardService.getBookingTrends(days ? parseInt(days) : 30);
    }
    async getCalendarOccupancy(months) {
        return this.dashboardService.getCalendarOccupancy(months ? parseInt(months) : 12);
    }
    async getRoomBookingsCalendar(roomId, startDate, endDate) {
        return this.dashboardService.getRoomBookingsCalendar(roomId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async getDailyBookings(days) {
        return this.dashboardService.getDailyBookings(days ? parseInt(days) : 30);
    }
    async getMostBookedRooms(limit) {
        return this.dashboardService.getMostBookedRooms(limit ? parseInt(limit) : 5);
    }
    async getBookingStatusBreakdown() {
        return this.dashboardService.getBookingStatusBreakdown();
    }
    async getRevenueByRoomType() {
        return this.dashboardService.getRevenueByRoomType();
    }
    async getGuestStats() {
        return this.dashboardService.getGuestStats();
    }
    async blockDates(dto) {
        return this.dashboardService.blockDates(dto.roomId, new Date(dto.startDate), new Date(dto.endDate), dto.reason);
    }
    async getBlockedDates(roomId) {
        return this.dashboardService.getBlockedDates(roomId);
    }
    async deleteBlockedDate(id) {
        return this.dashboardService.deleteBlockedDate(id);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('revenue'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue overview' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false }),
    __param(0, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRevenue", null);
__decorate([
    (0, common_1.Get)('recent-bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent bookings' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRecentBookings", null);
__decorate([
    (0, common_1.Get)('trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking trends' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTrends", null);
__decorate([
    (0, common_1.Get)('calendar/occupancy'),
    (0, swagger_1.ApiOperation)({ summary: 'Get calendar occupancy view' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false }),
    __param(0, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCalendarOccupancy", null);
__decorate([
    (0, common_1.Get)('calendar/rooms'),
    (0, swagger_1.ApiOperation)({ summary: 'Get room bookings calendar' }),
    (0, swagger_1.ApiQuery)({ name: 'roomId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Query)('roomId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRoomBookingsCalendar", null);
__decorate([
    (0, common_1.Get)('analytics/daily-bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily bookings for chart' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDailyBookings", null);
__decorate([
    (0, common_1.Get)('analytics/most-booked-rooms'),
    (0, swagger_1.ApiOperation)({ summary: 'Get most booked room types' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getMostBookedRooms", null);
__decorate([
    (0, common_1.Get)('analytics/booking-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking status breakdown' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getBookingStatusBreakdown", null);
__decorate([
    (0, common_1.Get)('analytics/revenue-by-room-type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue by room type' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRevenueByRoomType", null);
__decorate([
    (0, common_1.Get)('analytics/guest-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get guest statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getGuestStats", null);
__decorate([
    (0, common_1.Post)('block-dates'),
    (0, swagger_1.ApiOperation)({ summary: 'Block dates for a room' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "blockDates", null);
__decorate([
    (0, common_1.Get)('block-dates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get blocked dates' }),
    (0, swagger_1.ApiQuery)({ name: 'roomId', required: false }),
    __param(0, (0, common_1.Query)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getBlockedDates", null);
__decorate([
    (0, common_1.Delete)('block-dates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete blocked date' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "deleteBlockedDate", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map