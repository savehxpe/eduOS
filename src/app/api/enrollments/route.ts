import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest, formatDbError } from "@/lib/api-auth";
import { enrollmentSchema } from "@/lib/validators";

/**
 * GET /api/enrollments
 * Lists enrollments (filtered by class_id or student_id).
 */
export async function GET(request: NextRequest) {
    const auth = await authenticateRequest(request, ["admin", "teacher"]);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class_id");
    const studentId = searchParams.get("student_id");

    let query = supabaseAdmin
        .from("enrollments")
        .select(`
      *,
      students_profile (
        student_id,
        users (id, first_name, last_name, email)
      ),
      classes (
        class_id,
        semester,
        academic_year,
        subjects (subject_name, subject_code)
      )
    `);

    if (classId) query = query.eq("class_id", classId);
    if (studentId) query = query.eq("student_id", studentId);

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
 * POST /api/enrollments
 * Enrolls a student in a class (Admin only).
 */
export async function POST(request: NextRequest) {
    const auth = await authenticateRequest(request, ["admin"]);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const parsed = enrollmentSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("enrollments")
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
