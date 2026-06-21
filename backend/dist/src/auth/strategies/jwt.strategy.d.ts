import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export interface JwtPayload {
    sub: string;
    email: string;
}
export interface RequestUser {
    id: string;
    email: string;
    role: UserRole;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private config;
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<RequestUser>;
}
export {};
