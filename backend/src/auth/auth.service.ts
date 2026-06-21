import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, ActivityStatus } from '@prisma/client';
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

const MAX_FAILED_ATTEMPTS = 3;
const LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private activityLog: ActivityLogService,
  ) {}

  async register(dto: RegisterDto, meta?: { ip?: string; userAgent?: string }): Promise<AuthResponse> {
    const role = dto.role ? (dto.role as UserRole) : UserRole.CUSTOMER;
    const normalizedRole =
      role === UserRole.GUEST ? UserRole.CUSTOMER : role;

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: normalizedRole,
    });

    if (normalizedRole === UserRole.CUSTOMER) {
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

  async login(
    dto: LoginDto,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      await this.activityLog.log({
        action: 'LOGIN_FAILED',
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent,
        status: ActivityStatus.FAILED,
        metadata: { email: dto.email, reason: 'user_not_found' },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      throw new HttpException(
        {
          message: 'Account temporarily locked due to multiple failed login attempts',
          lockedUntil: user.lockedUntil,
          remainingSeconds: Math.ceil(remainingMs / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const valid = await this.passwordService.verify(dto.password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const updateData: { failedLoginAttempts: number; lockedUntil?: Date } = {
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
        status: ActivityStatus.FAILED,
        metadata: { attempts },
      });

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        throw new HttpException(
          {
            message: 'Account locked for 1 hour after 3 failed login attempts',
            lockedUntil: updateData.lockedUntil,
            remainingSeconds: LOCK_DURATION_MS / 1000,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
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

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
  }

  private async generateTokens(userId: string, email: string, role: UserRole): Promise<AuthTokens> {
    const expiresIn = 900;
    const accessToken = this.jwtService.sign({ sub: userId, email, role }, { expiresIn });

    const refreshToken = uuidv4();
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt: refreshExpires },
    });

    return { accessToken, refreshToken, expiresIn };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId } });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    return { message: 'Logged out successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    return { message: 'If the email exists, a reset link has been sent', token };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.expiresAt < new Date() || reset.usedAt) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await this.passwordService.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      this.prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    ]);

    return { message: 'Password reset successfully' };
  }
}
