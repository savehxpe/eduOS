import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest, formatDbError } from "@/lib/api-auth";
import { classSchema } from "@/lib/validators";

/**
 * GET /api/classes
 * Fetches classes. Teachers see only their own.
 */
export async function GET(request: NextRequest) {
    const auth = authenticateRequest(request, ["admin", "teacher"]);
    if (auth instanceof NextResponse) return auth;

    let query = supabaseAdmin
        .from("classes")
        .select(`
      *,
      subjects (subject_id, subject_code, subject_name, credits),
      users!classes_teacher_id_fkey (first_name, last_name, email)
    `)
        .order("academic_year", { ascending: false });

    // Teachers only see their own classes
    if (auth.user.role === "teacher") {
        query = query.eq("teacher_id", auth.user.userId);
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
 * POST /api/classes
 * Creates a new class (Admin only).
 */
export async function POST(request: NextRequest) {
    const auth = authenticateRequest(request, ["admin"]);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const parsed = classSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("classes")
            .insert(parsed.data)
            .select(`
        *,
        subjects (subject_id, subject_code, subject_name, credits),
        users!classes_teacher_id_fkey (first_name, last_name, email)
      `)
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: formatDbError(error) },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request body." },
            { status: 400 }
        );
    }
}
