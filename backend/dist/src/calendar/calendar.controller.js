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
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const calendar_service_1 = require("./calendar.service");
let CalendarController = class CalendarController {
    constructor(calendar) {
        this.calendar = calendar;
    }
    async getAvailability(roomTypeId, startDate, endDate) {
        return this.calendar.getAvailability({
            roomTypeId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Get)('availability'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Room type availability by date' }),
    (0, swagger_1.ApiQuery)({ name: 'roomTypeId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, description: 'YYYY-MM-DD or ISO date' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, description: 'YYYY-MM-DD or ISO date' }),
    __param(0, (0, common_1.Query)('roomTypeId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getAvailability", null);
exports.CalendarController = CalendarController = __decorate([
    (0, swagger_1.ApiTags)('calendar'),
    (0, common_1.Controller)('calendar'),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map