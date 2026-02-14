import { get } from "http";
import { Middleware, MiddlewareContext, MiddlewareResult } from "../types";
import { getSupabaseClient } from "@/src/lib/supabase/client";

export class AuthMiddleware implements Middleware {
    async execute(context: MiddlewareContext): Promise<MiddlewareResult> {
        const supabase = getSupabaseClient();

        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session) {
            return {
                success: false,
                error: "Authentication required",
            };
          }

          // Fetch user details
          const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          
          if (userError || !user) {
            return {
                success: false,
                error: "User not found",
            };
          }

          return {
            success: true,
            context: {
                ...context,
                user,
                session,
                }
            };
          } catch (error) {
            return {
                success: false,
                error: "Authentication failed",
            };
          }
        }
}
