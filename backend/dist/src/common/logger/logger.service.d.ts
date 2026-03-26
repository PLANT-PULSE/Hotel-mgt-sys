import { LoggerService as NestLoggerService } from '@nestjs/common';
export declare class LoggerService implements NestLoggerService {
    private logger;
    constructor();
    log(message: string, ...optionalParams: unknown[]): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, ...optionalParams: unknown[]): void;
    debug(message: string, ...optionalParams: unknown[]): void;
    verbose(message: string, ...optionalParams: unknown[]): void;
}
