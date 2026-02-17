// ============================================
// LOGGER SERVICE
// File: src/services/LoggerService.ts
// ============================================

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  [key: string]: any;
}

class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!this.instance) {
      this.instance = new LoggerService();
    }
    return this.instance;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error | unknown
  ): void {
    const timestamp = new Date().toISOString();
    const logMethod =
      level === LogLevel.ERROR
        ? console.error
        : level === LogLevel.WARN
        ? console.warn
        : console.log;

    // Format the log message
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Safely handle context
    const safeContext = context ? this.sanitizeContext(context) : null;
    
    // Safely handle error
    const safeError = error ? this.formatError(error) : null;

    // Log based on what we have
    if (safeContext && safeError) {
      logMethod(logMessage, safeContext, safeError);
    } else if (safeContext) {
      logMethod(logMessage, safeContext);
    } else if (safeError) {
      logMethod(logMessage, safeError);
    } else {
      logMethod(logMessage);
    }

    // In production, send to logging service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production' && level === LogLevel.ERROR) {
      this.sendToExternalLogger(level, message, safeContext, safeError);
    }
  }

  /**
   * Sanitize context to avoid circular references and undefined values
   */
  private sanitizeContext(context: LogContext): Record<string, any> {
    try {
      return JSON.parse(JSON.stringify(context, (key, value) => {
        if (value === undefined) return null;
        if (value === null) return null;
        return value;
      }));
    } catch (error) {
      return { error: 'Failed to sanitize context' };
    }
  }

  /**
   * Format error object safely
   */
  private formatError(error: Error | unknown): Record<string, any> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (typeof error === 'string') {
      return { message: error };
    }

    if (typeof error === 'object' && error !== null) {
      try {
        return JSON.parse(JSON.stringify(error));
      } catch {
        return { message: String(error) };
      }
    }

    return { message: String(error) };
  }

  /**
   * Send to external logging service
   */
  private sendToExternalLogger(
    level: LogLevel,
    message: string,
    context?: Record<string, any> | null,
    error?: Record<string, any> | null
  ): void {
    // TODO: Implement integration with external logging service
    // Example: Sentry, LogRocket, Datadog, etc.
    /*
    try {
      Sentry.captureMessage(message, {
        level: level.toLowerCase() as Sentry.SeverityLevel,
        extra: { ...context, error },
      });
    } catch (err) {
      console.error('Failed to send log to external service:', err);
    }
    */
  }

  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, error: Error | unknown, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }
}

export const logger = LoggerService.getInstance();