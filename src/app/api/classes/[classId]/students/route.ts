import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest, formatDbError } from "@/lib/api-auth";

/**
 * GET /api/classes/[classId]/students
 * Returns roster for a specific class.
 * Per MASTER_CONTEXT Section 7: GET /api/classes/{class_id}/students
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    const auth = await authenticateRequest(request, ["admin", "teacher"]);
    if (auth instanceof NextResponse) return auth;

    const { classId } = await params;

    // If teacher, verify they own this class
    if (auth.user.role === "teacher") {
        const { data: cls } = await supabaseAdmin
            .from("classes")
            .select("teacher_id")
            .eq("class_id", classId)
            .single();

        if (!cls || cls.teacher_id !== auth.user.userId) {
            return NextResponse.json(
                { success: false, error: "Access denied. You are not assigned to this class." },
                { status: 403 }
            );
        }
    }

    const { data, error } = await supabaseAdmin
        .from("enrollments")
        .select(`
      enrollment_id,
      status,
      student_id,
      students_profile (
        student_id,
        date_of_birth,
        enrollment_year,
        users (id, first_name, last_name, email)
      )
    `)
        .eq("class_id", classId)
        .eq("status", "active");

    if (error) {
        return NextResponse.json(
            { success: false, error: formatDbError(error) },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, data });
}
