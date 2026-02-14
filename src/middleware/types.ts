export interface MiddlewareContext {
    user?: any;
    data?: any;
    metadata?: Record<string, any>;
    [key: string]: any; 
}

export interface MiddlewareResult {
    success: boolean;
    error?: string;
    context?: MiddlewareContext;
}

export interface Middleware {
    execute(context: MiddlewareContext): Promise<MiddlewareResult>;
}