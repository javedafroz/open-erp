import { LogLevel } from '@erp/shared';
export class Logger {
    service;
    level;
    constructor(service, level = LogLevel.INFO) {
        this.service = service;
        this.level = level;
    }
    shouldLog(level) {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        return levels.indexOf(level) <= levels.indexOf(this.level);
    }
    formatMessage(level, message, context, error) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            service: this.service,
            message,
            ...context,
            ...(error && { error: { message: error.message, stack: error.stack } }),
        };
        return JSON.stringify(logEntry);
    }
    error(message, context, error) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage(LogLevel.ERROR, message, context, error));
        }
    }
    warn(message, context) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, message, context));
        }
    }
    info(message, context) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage(LogLevel.INFO, message, context));
        }
    }
    debug(message, context) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
        }
    }
}
export const createLogger = (service, level) => {
    return new Logger(service, level);
};
//# sourceMappingURL=logger.js.map