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
exports.GuestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GuestsService = class GuestsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [guests, total] = await Promise.all([
            this.prisma.guest.findMany({
                include: {
                    user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
                },
                skip,
                take: limit,
            }),
            this.prisma.guest.count(),
        ]);
        return { data: guests, meta: { page, limit, total } };
    }
    async findById(id) {
        const guest = await this.prisma.guest.findUnique({
            where: { id },
            include: {
                user: true,
                bookings: { include: { items: { include: { roomType: true } } } },
            },
        });
        if (!guest)
            throw new common_1.NotFoundException('Guest not found');
        return guest;
    }
    async findByUserId(userId) {
        const guest = await this.prisma.guest.findUnique({
            where: { userId },
            include: { user: true },
        });
        if (!guest)
            throw new common_1.NotFoundException('Guest not found');
        return guest;
    }
    async updateLoyaltyPoints(id, points) {
        const guest = await this.prisma.guest.findUnique({ where: { id } });
        if (!guest)
            throw new common_1.NotFoundException('Guest not found');
        const newPoints = guest.loyaltyPoints + points;
        return this.prisma.guest.update({
            where: { id },
            data: { loyaltyPoints: Math.max(0, newPoints) },
        });
    }
};
exports.GuestsService = GuestsService;
exports.GuestsService = GuestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GuestsService);
//# sourceMappingURL=guests.service.js.map