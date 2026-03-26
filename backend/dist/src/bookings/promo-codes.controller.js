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
exports.PromoCodesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let PromoCodesController = class PromoCodesController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const now = new Date();
        return this.prisma.promoCode.findMany({
            where: {
                isActive: true,
                validFrom: { lte: now },
                validTo: { gte: now },
            },
        });
    }
    async validate(body) {
        const promo = await this.prisma.promoCode.findFirst({
            where: {
                code: body.code?.toUpperCase(),
                isActive: true,
                validFrom: { lte: new Date() },
                validTo: { gte: new Date() },
            },
        });
        if (!promo)
            return { valid: false, discount: 0 };
        return {
            valid: true,
            discount: Number(promo.discount),
            description: promo.description,
        };
    }
};
exports.PromoCodesController = PromoCodesController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'List active promo codes (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PromoCodesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Validate promo code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromoCodesController.prototype, "validate", null);
exports.PromoCodesController = PromoCodesController = __decorate([
    (0, swagger_1.ApiTags)('promo-codes'),
    (0, common_1.Controller)('promo-codes'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromoCodesController);
//# sourceMappingURL=promo-codes.controller.js.map