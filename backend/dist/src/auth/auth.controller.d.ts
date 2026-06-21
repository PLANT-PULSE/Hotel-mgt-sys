import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { RequestUser } from './strategies/jwt.strategy';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, req: Request): Promise<import("./auth.service").AuthResponse>;
    login(dto: LoginDto, req: Request): Promise<import("./auth.service").AuthResponse>;
    forgotPassword(email: string): Promise<{
        message: string;
        token?: undefined;
    } | {
        message: string;
        token: string;
    }>;
    resetPassword(body: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
    refresh(dto: RefreshTokenDto): Promise<import("./auth.service").AuthTokens>;
    logout(user: RequestUser, body?: {
        refreshToken?: string;
    }): Promise<{
        message: string;
    }>;
}
