import { Middleware, MiddlewareContext, MiddlewareResult } from "../types";

export class RoleMiddleware implements Middleware {
    constructor(private readonly allowedRoles: string[]) {}

    async execute(context: MiddlewareContext): Promise<MiddlewareResult> {
        if (!context.user) {
            return {
                success: false,
                error: "User not authenticated",
            };
        }

        if (!this.allowedRoles.includes(context.user.role)) {
            return {
                success: false,
                error: `Access denied. Required roles: ${this.allowedRoles.join(',')}`,
            };
        }

        return {
            success: true,
            context,
        };
    }


}