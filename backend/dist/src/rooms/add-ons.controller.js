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
exports.AddOnsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let AddOnsController = class AddOnsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return this.prisma.addOn.findMany({
            where: { isActive: true },
        });
    }
};
exports.AddOnsController = AddOnsController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'List add-ons (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AddOnsController.prototype, "list", null);
exports.AddOnsController = AddOnsController = __decorate([
    (0, swagger_1.ApiTags)('add-ons'),
    (0, common_1.Controller)('add-ons'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddOnsController);
//# sourceMappingURL=add-ons.controller.js.map