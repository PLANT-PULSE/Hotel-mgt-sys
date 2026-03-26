import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    error?: string;
    timestamp: string;
    path: string;
}
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
