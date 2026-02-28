import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest, formatDbError } from "@/lib/api-auth";
import { subjectSchema } from "@/lib/validators";

/**
 * GET /api/subjects
 * Fetches all subjects.
 */
export async function GET(request: NextRequest) {
    const auth = await authenticateRequest(request, ["admin", "teacher"]);
    if (auth instanceof NextResponse) return auth;

    const { data, error } = await supabaseAdmin
        .from("subjects")
        .select("*")
        .order("subject_name");

    if (error) {
        return NextResponse.json(
            { success: false, error: formatDbError(error) },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, data });
}

/**
 * POST /api/subjects
 * Creates a new subject (Admin only).
 */
export async function POST(request: NextRequest) {
    const auth = await authenticateRequest(request, ["admin"]);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const parsed = subjectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("subjects")
            .insert(parsed.data)
            .select()
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
