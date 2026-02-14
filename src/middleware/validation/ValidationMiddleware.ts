import { Middleware, MiddlewareContext, MiddlewareResult } from '../types';
import { ZodSchema } from 'zod';

export class ValidationMiddleware implements Middleware {
  constructor(
    private readonly schema: ZodSchema,
    private readonly dataKey: string = 'data'
  ) {}

  async execute(context: MiddlewareContext): Promise<MiddlewareResult> {
    const data = context[this.dataKey];

    if (!data) {
        return {
            success: false,
            error: `No data found at key: ${this.dataKey}`,
        };
    }
    
    try {
      const validatedData = this.schema.parse(data);

      return {
        success: true,
        context: {
            ...context,
            [this.dataKey]: validatedData,
        },
      };
    } catch (error: any) {
        return {
            success: false,
            error: `Validation failed: ${error.message}`,
        };
    }
  }
}