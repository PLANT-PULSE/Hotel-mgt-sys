import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
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
}
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<AuthTokens>;
    private generateTokens;
    logout(userId: string, refreshToken?: string): Promise<{
        message: string;
    }>;
}
