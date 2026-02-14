export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
}

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: Record<string, any>;  
    error?: Error; // Optional error object for ERROR level logs
}

export class LoggerService {
    private static instance: LoggerService | null = null;
    private logs: LogEntry[] = [];
    private maxLogs: number = 1000; // Max logs to keep in memory

    private constructor() {}

    public static getInstance(): LoggerService {
        if (!this.instance) {
            this.instance = new LoggerService();
        }
        return this.instance;
    }

    private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            message,
            context,
            error,
        };

        this.logs.push(entry);

        // Keep only las maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // console output
        const logMethod = level === LogLevel.ERROR ? console.error : level === LogLevel.WARN ? console.warn : console.log;

        logMethod(`[${level}] ${message}`, context || '', error || '');

        // In production, send to logging service (e.g., sentry)
        if (process.env.NODE_ENV === "production" && level === LogLevel.ERROR) {
            this.sendToExternalService(entry);
        }
    }

    public info(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.INFO, message, context);
    }

    public error(message: string, context?: Record<string, any>, error?: Error): void {
        this.log(LogLevel.ERROR, message, context, error);
    }

    public debug(message: string, context?: Record<string, any>):
    void {
        this.log(LogLevel.DEBUG, message, context);
    }

    public warn(message: string, context?: Record<string, any>):
    void {
        this.log(LogLevel.WARN, message, context);
    }

    public getLogs(level?: LogLevel): LogEntry[] {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return [...this.logs];
    }

    public clearLogs(): void {
        this.logs = [];
    }

    private sendToExternalService(entry: LogEntry): void {
        // Implement external logging service integration
        // e.g., Sentry, LogRocket, etc.
    }
}

// Export convenience functions
export const logger = LoggerService.getInstance();