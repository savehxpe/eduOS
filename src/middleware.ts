import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/api/auth/login"];

// Role-based route access mapping
const ROLE_ROUTES: Record<string, string[]> = {
    admin: ["/admin"],
    teacher: ["/teacher"],
    student: ["/student"],
    parent: ["/parent"],
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static assets and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Check for auth token in cookie
    const token = request.cookies.get("eduos-token")?.value;

    if (!token) {
        // Redirect to login if no token
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Decode JWT payload (base64) to check role without verifying on edge
    // Full verification happens in API routes
    try {
        const payloadBase64 = token.split(".")[1];
        const payload = JSON.parse(atob(payloadBase64));
        const userRole = payload.role;

        // Check role-based access for dashboard routes
        for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
            for (const route of routes) {
                if (pathname.startsWith(route) && userRole !== role) {
                    // Redirect to their own dashboard
                    return NextResponse.redirect(
                        new URL(`/${userRole}`, request.url)
                    );
                }
            }
        }

        // Add user info to request headers for API routes
        const response = NextResponse.next();
        response.headers.set("x-user-id", payload.userId);
        response.headers.set("x-user-role", payload.role);
        response.headers.set("x-user-email", payload.email);
        return response;
    } catch {
        // Invalid token — redirect to login
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
