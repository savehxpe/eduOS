import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest, formatDbError } from "@/lib/api-auth";

/**
 * GET /api/grades/class/[classId]
 * Returns aggregate gradebook data for a class section.
 * Per MASTER_CONTEXT Section 7: GET /api/grades/class/{class_id}
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    const auth = authenticateRequest(request, ["admin", "teacher"]);
    if (auth instanceof NextResponse) return auth;

    const { classId } = await params;

    // Teacher class ownership
    if (auth.user.role === "teacher") {
        const { data: cls } = await supabaseAdmin
            .from("classes")
            .select("teacher_id")
            .eq("class_id", classId)
            .single();

        if (!cls || cls.teacher_id !== auth.user.userId) {
            return NextResponse.json(
                { success: false, error: "Access denied." },
                { status: 403 }
            );
        }
    }

    const { data, error } = await supabaseAdmin
        .from("grades")
        .select(`
      *,
      students_profile (
        student_id,
        users (first_name, last_name, email)
      )
    `)
        .eq("class_id", classId)
        .order("assessment_type");

    if (error) {
        return NextResponse.json(
            { success: false, error: formatDbError(error) },
            { status: 500 }
        );
    }

    // Compute aggregate stats
    const scores = data?.map((g) => (g.score / g.max_score) * 100) || [];
    const average = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    const highest = scores.length > 0 ? Math.round(Math.max(...scores)) : 0;
    const lowest = scores.length > 0 ? Math.round(Math.min(...scores)) : 0;

    // Group by assessment type
    const assessmentTypes = [...new Set(data?.map((g) => g.assessment_type) || [])];

    return NextResponse.json({
        success: true,
        data: {
            grades: data,
            summary: {
                totalGrades: data?.length || 0,
                averagePercentage: average,
                highestPercentage: highest,
                lowestPercentage: lowest,
                assessmentTypes,
            },
        },
    });
}
