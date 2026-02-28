import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest, formatDbError } from "@/lib/api-auth";
import { createUserSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/auth";

/**
 * GET /api/users
 * Fetches user directory (Admin only).
 * Per MASTER_CONTEXT Section 7: GET /api/users
 */
export async function GET(request: NextRequest) {
    const auth = await authenticateRequest(request, ["admin"]);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let query = supabaseAdmin
        .from("users")
        .select("id, role, email, first_name, last_name, created_at")
        .order("created_at", { ascending: false });

    if (role) {
        query = query.eq("role", role);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json(
            { success: false, error: formatDbError(error) },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, data });
}

/**
 * POST /api/users
 * Creates a new user (Admin only).
 */
export async function POST(request: NextRequest) {
    const auth = await authenticateRequest(request, ["admin"]);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const parsed = createUserSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.issues.map((i) => i.message).join(", ");
            return NextResponse.json(
                { success: false, error: errors },
                { status: 400 }
            );
        }

        const { email, password, first_name, last_name, role } = parsed.data;
        const password_hash = await hashPassword(password);

        const { data, error } = await supabaseAdmin
            .from("users")
            .insert({ email, password_hash, first_name, last_name, role })
            .select("id, role, email, first_name, last_name, created_at")
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: formatDbError(error) },
                { status: 400 }
            );
        }

        // If user is a student, create student profile
        if (role === "student") {
            await supabaseAdmin.from("students_profile").insert({
                student_id: data.id,
                enrollment_year: new Date().getFullYear(),
            });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request body." },
            { status: 400 }
        );
    }
}
