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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(usersService, jwtService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async register(dto) {
        const user = await this.usersService.create({
            email: dto.email,
            password: dto.password,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            role: dto.role ? dto.role : client_1.UserRole.GUEST,
        });
        if (user.role === client_1.UserRole.GUEST) {
            await this.prisma.guest.create({
                data: { userId: user.id },
            });
        }
        const tokens = await this.generateTokens(user.id, user.email);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            tokens,
        };
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        await this.usersService.updateLastLogin(user.id);
        const tokens = await this.generateTokens(user.id, user.email);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            tokens,
        };
    }
    async refresh(refreshToken) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!stored || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });
        return this.generateTokens(stored.user.id, stored.user.email);
    }
    async generateTokens(userId, email) {
        const expiresIn = 900;
        const accessToken = this.jwtService.sign({ sub: userId, email }, { expiresIn });
        const refreshToken = (0, uuid_1.v4)();
        const refreshExpires = new Date();
        refreshExpires.setDate(refreshExpires.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt: refreshExpires,
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn,
        };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.prisma.refreshToken.deleteMany({
                where: { token: refreshToken, userId },
            });
        }
        else {
            await this.prisma.refreshToken.deleteMany({ where: { userId } });
        }
        return { message: 'Logged out successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map