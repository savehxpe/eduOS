import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest, formatDbError } from "@/lib/api-auth";

/**
 * GET /api/attendance/student/[studentId]
 * Returns individual student attendance history.
 * Per MASTER_CONTEXT Section 7: GET /api/attendance/student/{student_id}
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const auth = authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;

    const { studentId } = await params;

    // Students can only see their own attendance
    if (auth.user.role === "student" && auth.user.userId !== studentId) {
        return NextResponse.json(
            { success: false, error: "Access denied. You can only view your own attendance." },
            { status: 403 }
        );
    }

    // Parents can only see their children's attendance
    if (auth.user.role === "parent") {
        const { data: child } = await supabaseAdmin
            .from("students_profile")
            .select("student_id")
            .eq("student_id", studentId)
            .eq("parent_id", auth.user.userId)
            .single();

        if (!child) {
            return NextResponse.json(
                { success: false, error: "Access denied. This student is not linked to your account." },
                { status: 403 }
            );
        }
    }

    const { data, error } = await supabaseAdmin
        .from("attendance")
        .select(`
      *,
      classes (
        class_id,
        semester,
        academic_year,
        subjects (subject_name, subject_code)
      )
    `)
        .eq("student_id", studentId)
        .order("date", { ascending: false });

    if (error) {
        return NextResponse.json(
            { success: false, error: formatDbError(error) },
            { status: 500 }
        );
    }

    // Calculate attendance percentage
    const total = data?.length || 0;
    const present = data?.filter(
        (a) => a.status === "present" || a.status === "late"
    ).length || 0;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return NextResponse.json({
        success: true,
        data: {
            records: data,
            summary: {
                total,
                present: data?.filter((a) => a.status === "present").length || 0,
                late: data?.filter((a) => a.status === "late").length || 0,
                absent: data?.filter((a) => a.status === "absent").length || 0,
                attendanceRate,
            },
        },
    });
}
