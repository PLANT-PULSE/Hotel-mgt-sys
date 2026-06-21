import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { PasswordService } from '../common/services/password.service';
import { ActivityLogService } from '../common/services/activity-log.service';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
    };
    tokens: AuthTokens;
    lockedUntil?: Date;
}
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    private passwordService;
    private activityLog;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService, passwordService: PasswordService, activityLog: ActivityLogService);
    register(dto: RegisterDto, meta?: {
        ip?: string;
        userAgent?: string;
    }): Promise<AuthResponse>;
    login(dto: LoginDto, meta?: {
        ip?: string;
        userAgent?: string;
    }): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<AuthTokens>;
    private generateTokens;
    logout(userId: string, refreshToken?: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
        token?: undefined;
    } | {
        message: string;
        token: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
