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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const reservation_lock_service_1 = require("./reservation-lock.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const create_reservation_lock_dto_1 = require("./dto/create-reservation-lock.dto");
const update_booking_status_dto_1 = require("./dto/update-booking-status.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
let BookingsController = class BookingsController {
    constructor(bookingsService, reservationLockService) {
        this.bookingsService = bookingsService;
        this.reservationLockService = reservationLockService;
    }
    async checkAvailability(roomTypeId, checkInDate, checkOutDate) {
        return this.reservationLockService.checkAvailability(roomTypeId, new Date(checkInDate), new Date(checkOutDate));
    }
    async createReservationLock(dto) {
        return this.reservationLockService.createLock(dto.roomTypeId, new Date(dto.checkInDate), new Date(dto.checkOutDate), dto.quantity ?? 1);
    }
    async releaseReservationLock(token) {
        await this.reservationLockService.releaseLock(token);
        return { message: 'Lock released' };
    }
    async create(dto, user) {
        return this.bookingsService.create(dto, user);
    }
    async findAll(status, page, limit) {
        return this.bookingsService.findAll({
            status,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }
    async getMyBookings(user) {
        return this.bookingsService.findMyBookings(user.id);
    }
    async lookup(number) {
        return this.bookingsService.findByNumber(number);
    }
    async findOne(id) {
        return this.bookingsService.findById(id);
    }
    async updateStatus(id, dto) {
        return this.bookingsService.updateStatus(id, dto.status);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Get)('availability'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check room availability for dates' }),
    (0, swagger_1.ApiQuery)({ name: 'roomTypeId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'checkInDate', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'checkOutDate', required: true }),
    __param(0, (0, common_1.Query)('roomTypeId')),
    __param(1, (0, common_1.Query)('checkInDate')),
    __param(2, (0, common_1.Query)('checkOutDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "checkAvailability", null);
__decorate([
    (0, common_1.Post)('reservation-lock'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Hold rooms temporarily to prevent double booking during checkout' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reservation_lock_dto_1.CreateReservationLockDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createReservationLock", null);
__decorate([
    (0, common_1.Delete)('reservation-lock/:token'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Release a reservation hold' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "releaseReservationLock", null);
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create booking (guest checkout)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.RECEPTIONIST),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all bookings (staff)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_2.BookingStatus }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my bookings (guest)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getMyBookings", null);
__decorate([
    (0, common_1.Get)('lookup/:number'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lookup booking by number (e.g. LXS-2024-00123)' }),
    __param(0, (0, common_1.Param)('number')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "lookup", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.RECEPTIONIST),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update booking status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_booking_status_dto_1.UpdateBookingStatusDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updateStatus", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('bookings'),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService,
        reservation_lock_service_1.ReservationLockService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map