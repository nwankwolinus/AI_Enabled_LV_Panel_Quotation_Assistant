import { Middleware, MiddlewareContext, MiddlewareResult } from "./types";

export class MiddlewareChain {
    private middlewares: Middleware[] = [];

    public use(middleware: Middleware): this {
        this.middlewares.push(middleware);
        return this;
    }

    public async execute(initialContext: MiddlewareContext = {}):
        Promise<MiddlewareResult> {
          let context = { ...initialContext };

          for (const middleware of this.middlewares) {
            const result = await middleware.execute(context);

            if (!result.success) {
                return result; // stop on first failure
            }

            // Merge context from successful middleware
            if (result.context) {
                context = { ...context, ...result.context };
            }
          }

          return {
            success: true,
            context,
          };
    }
}