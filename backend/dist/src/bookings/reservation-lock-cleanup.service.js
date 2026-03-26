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
exports.ReservationLockCleanupService = void 0;
const common_1 = require("@nestjs/common");
const reservation_lock_service_1 = require("./reservation-lock.service");
let ReservationLockCleanupService = class ReservationLockCleanupService {
    constructor(locks) {
        this.locks = locks;
        this.interval = null;
    }
    onModuleInit() {
        this.interval = setInterval(() => {
            void this.locks.cleanupExpiredLocks();
        }, 60_000);
    }
    onModuleDestroy() {
        if (this.interval)
            clearInterval(this.interval);
        this.interval = null;
    }
};
exports.ReservationLockCleanupService = ReservationLockCleanupService;
exports.ReservationLockCleanupService = ReservationLockCleanupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reservation_lock_service_1.ReservationLockService])
], ReservationLockCleanupService);
//# sourceMappingURL=reservation-lock-cleanup.service.js.map