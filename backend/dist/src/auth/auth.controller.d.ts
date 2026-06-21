import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { RequestUser } from './strategies/jwt.strategy';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./auth.service").AuthResponse>;
    login(dto: LoginDto): Promise<import("./auth.service").AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<import("./auth.service").AuthTokens>;
    logout(user: RequestUser, body?: {
        refreshToken?: string;
    }): Promise<{
        message: string;
    }>;
}
