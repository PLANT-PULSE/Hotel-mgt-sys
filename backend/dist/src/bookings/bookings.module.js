"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsModule = void 0;
const common_1 = require("@nestjs/common");
const bookings_controller_1 = require("./bookings.controller");
const bookings_service_1 = require("./bookings.service");
const reservation_lock_service_1 = require("./reservation-lock.service");
const promo_codes_controller_1 = require("./promo-codes.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const events_module_1 = require("../events/events.module");
let BookingsModule = class BookingsModule {
};
exports.BookingsModule = BookingsModule;
exports.BookingsModule = BookingsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, events_module_1.EventsModule],
        controllers: [bookings_controller_1.BookingsController, promo_codes_controller_1.PromoCodesController],
        providers: [bookings_service_1.BookingsService, reservation_lock_service_1.ReservationLockService],
        exports: [bookings_service_1.BookingsService, reservation_lock_service_1.ReservationLockService],
    })
], BookingsModule);
//# sourceMappingURL=bookings.module.js.map