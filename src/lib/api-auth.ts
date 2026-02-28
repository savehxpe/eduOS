import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken, type JWTPayload } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

/**
 * Authenticates API request and verifies role authorization.
 * Returns the decoded JWT payload or a 401/403 error response.
 */
export async function authenticateRequest(
    request: NextRequest,
    allowedRoles?: UserRole[]
): Promise<{ user: JWTPayload } | NextResponse> {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("eduos-token")?.value;
    const token = extractToken(authHeader) || cookieToken;

    if (!token) {
        return NextResponse.json(
            { success: false, error: "Authentication required. Please log in." },
            { status: 401 }
        );
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json(
            { success: false, error: "Invalid or expired token. Please log in again." },
            { status: 401 }
        );
    }

    if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return NextResponse.json(
            {
                success: false,
                error: `Access denied. This resource requires one of: ${allowedRoles.join(", ")}`,
            },
            { status: 403 }
        );
    }

    return { user: payload };
}

/**
 * Format Supabase/DB error for user-facing display
 */
export function formatDbError(error: { message?: string; code?: string }): string {
    if (error.code === "23505") return "A record with this information already exists.";
    if (error.code === "23503") return "Referenced record not found. Please check your inputs.";
    return error.message || "An unexpected database error occurred.";
}
