import { LoggerService as NestLoggerService } from '@nestjs/common';
import pino from 'pino';

export class LoggerService implements NestLoggerService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    });
  }

  log(message: string, ...optionalParams: unknown[]) {
    this.logger.info({ context: optionalParams[0] }, message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ err: trace, context }, message);
  }

  warn(message: string, ...optionalParams: unknown[]) {
    this.logger.warn({ context: optionalParams[0] }, message);
  }

  debug(message: string, ...optionalParams: unknown[]) {
    this.logger.debug({ context: optionalParams[0] }, message);
  }

  verbose(message: string, ...optionalParams: unknown[]) {
    this.logger.trace({ context: optionalParams[0] }, message);
  }
}
