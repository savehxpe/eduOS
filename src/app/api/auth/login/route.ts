import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

/**
 * POST /api/auth/login
 * Validates credentials, returns JWT token.
 * Per MASTER_CONTEXT Section 7: POST /api/auth/login
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => i.message).join(", ");
            return NextResponse.json(
                { success: false, error: errors },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        // Fetch user by email
        const { data: user, error } = await supabaseAdmin
            .from("users")
            .select("id, role, email, password_hash, first_name, last_name")
            .eq("email", email)
            .single();

        if (error || !user) {
            return NextResponse.json(
                { success: false, error: "Invalid email or password." },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: "Invalid email or password." },
                { status: 401 }
            );
        }

        // Generate JWT
        const token = await signToken({
            userId: user.id,
            role: user.role,
            email: user.email,
        });

        // Set HTTP-only cookie and return token
        const response = NextResponse.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    role: user.role,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                },
            },
        });

        response.cookies.set("eduos-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 8, // 8 hours
            path: "/",
        });

        return response;
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
