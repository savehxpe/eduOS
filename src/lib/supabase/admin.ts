import { createClient } from "@supabase/supabase-js";

// Service-role client for admin operations (server-side only)
// Bypasses RLS — use only in API routes with proper authorization checks
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);
