"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const pino_1 = require("pino");
class LoggerService {
    constructor() {
        this.logger = (0, pino_1.default)({
            level: process.env.LOG_LEVEL || 'info',
            transport: process.env.NODE_ENV !== 'production'
                ? { target: 'pino-pretty', options: { colorize: true } }
                : undefined,
        });
    }
    log(message, ...optionalParams) {
        this.logger.info({ context: optionalParams[0] }, message);
    }
    error(message, trace, context) {
        this.logger.error({ err: trace, context }, message);
    }
    warn(message, ...optionalParams) {
        this.logger.warn({ context: optionalParams[0] }, message);
    }
    debug(message, ...optionalParams) {
        this.logger.debug({ context: optionalParams[0] }, message);
    }
    verbose(message, ...optionalParams) {
        this.logger.trace({ context: optionalParams[0] }, message);
    }
}
exports.LoggerService = LoggerService;
//# sourceMappingURL=logger.service.js.map