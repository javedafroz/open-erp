import { LogLevel } from '@erp/shared';
export interface LogContext {
    userId?: string;
    requestId?: string;
    service?: string;
    operation?: string;
    [key: string]: any;
}
export declare class Logger {
    private service;
    private level;
    constructor(service: string, level?: LogLevel);
    private shouldLog;
    private formatMessage;
    error(message: string, context?: LogContext, error?: Error): void;
    warn(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
}
export declare const createLogger: (service: string, level?: LogLevel) => Logger;
//# sourceMappingURL=logger.d.ts.map