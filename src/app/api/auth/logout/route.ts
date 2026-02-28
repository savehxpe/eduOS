import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Clears the auth cookie.
 */
export async function POST() {
    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.set("eduos-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
    return response;
}
