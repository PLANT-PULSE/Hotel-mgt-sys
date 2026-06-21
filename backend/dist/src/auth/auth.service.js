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
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const password_service_1 = require("../common/services/password.service");
const activity_log_service_1 = require("../common/services/activity-log.service");
const MAX_FAILED_ATTEMPTS = 3;
const LOCK_DURATION_MS = 60 * 60 * 1000;
let AuthService = class AuthService {
    constructor(usersService, jwtService, prisma, passwordService, activityLog) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.passwordService = passwordService;
        this.activityLog = activityLog;
    }
    async register(dto, meta) {
        const role = dto.role ? dto.role : client_1.UserRole.CUSTOMER;
        const normalizedRole = role === client_1.UserRole.GUEST ? client_1.UserRole.CUSTOMER : role;
        const user = await this.usersService.create({
            email: dto.email,
            password: dto.password,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            role: normalizedRole,
        });
        if (normalizedRole === client_1.UserRole.CUSTOMER) {
            await this.prisma.guest.create({ data: { userId: user.id } });
        }
        await this.activityLog.log({
            userId: user.id,
            role: normalizedRole,
            action: 'USER_REGISTERED',
            entity: 'User',
            entityId: user.id,
            ipAddress: meta?.ip,
            userAgent: meta?.userAgent,
        });
        const tokens = await this.generateTokens(user.id, user.email, normalizedRole);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: normalizedRole,
            },
            tokens,
        };
    }
    async login(dto, meta) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            await this.activityLog.log({
                action: 'LOGIN_FAILED',
                ipAddress: meta?.ip,
                userAgent: meta?.userAgent,
                status: client_1.ActivityStatus.FAILED,
                metadata: { email: dto.email, reason: 'user_not_found' },
            });
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const remainingMs = user.lockedUntil.getTime() - Date.now();
            throw new common_1.HttpException({
                message: 'Account temporarily locked due to multiple failed login attempts',
                lockedUntil: user.lockedUntil,
                remainingSeconds: Math.ceil(remainingMs / 1000),
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const valid = await this.passwordService.verify(dto.password, user.passwordHash);
        if (!valid) {
            const attempts = user.failedLoginAttempts + 1;
            const updateData = {
                failedLoginAttempts: attempts,
            };
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
                await this.prisma.emergencyAlert.create({
                    data: {
                        type: 'ACCOUNT_LOCKOUT',
                        severity: 'HIGH',
                        message: `Account locked after ${MAX_FAILED_ATTEMPTS} failed logins: ${user.email}`,
                        metadata: { userId: user.id, ip: meta?.ip },
                    },
                });
            }
            await this.prisma.user.update({ where: { id: user.id }, data: updateData });
            await this.activityLog.log({
                userId: user.id,
                role: user.role,
                action: attempts >= MAX_FAILED_ATTEMPTS ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
                ipAddress: meta?.ip,
                userAgent: meta?.userAgent,
                status: client_1.ActivityStatus.FAILED,
                metadata: { attempts },
            });
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                throw new common_1.HttpException({
                    message: 'Account locked for 1 hour after 3 failed login attempts',
                    lockedUntil: updateData.lockedUntil,
                    remainingSeconds: LOCK_DURATION_MS / 1000,
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Account is deactivated');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
        });
        await this.usersService.updateLastLogin(user.id);
        await this.activityLog.log({
            userId: user.id,
            role: user.role,
            action: 'LOGIN_SUCCESS',
            ipAddress: meta?.ip,
            userAgent: meta?.userAgent,
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
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
        return this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
    }
    async generateTokens(userId, email, role) {
        const expiresIn = 900;
        const accessToken = this.jwtService.sign({ sub: userId, email, role }, { expiresIn });
        const refreshToken = (0, uuid_1.v4)();
        const refreshExpires = new Date();
        refreshExpires.setDate(refreshExpires.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: { token: refreshToken, userId, expiresAt: refreshExpires },
        });
        return { accessToken, refreshToken, expiresIn };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId } });
        }
        else {
            await this.prisma.refreshToken.deleteMany({ where: { userId } });
        }
        return { message: 'Logged out successfully' };
    }
    async requestPasswordReset(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            return { message: 'If the email exists, a reset link has been sent' };
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await this.prisma.passwordReset.create({
            data: { userId: user.id, token, expiresAt },
        });
        return { message: 'If the email exists, a reset link has been sent', token };
    }
    async resetPassword(token, newPassword) {
        const reset = await this.prisma.passwordReset.findUnique({ where: { token } });
        if (!reset || reset.expiresAt < new Date() || reset.usedAt) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        const passwordHash = await this.passwordService.hash(newPassword);
        await this.prisma.$transaction([
            this.prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
            this.prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
        ]);
        return { message: 'Password reset successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService,
        password_service_1.PasswordService,
        activity_log_service_1.ActivityLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map