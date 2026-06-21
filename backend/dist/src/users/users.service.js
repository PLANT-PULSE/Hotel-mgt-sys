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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role ?? client_1.UserRole.GUEST,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase(), deletedAt: null },
            include: { guestProfile: true, staffProfile: true },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id, deletedAt: null },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                guestProfile: true,
                staffProfile: true,
                createdAt: true,
            },
        });
    }
    async updateLastLogin(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map