import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest, formatDbError } from "@/lib/api-auth";
import { bulkGradeSchema } from "@/lib/validators";

/**
 * POST /api/grades
 * Inserts or updates student assessment scores.
 * Per MASTER_CONTEXT Section 7: POST /api/grades
 * Workflow: Teacher inputs scores → system calculates % → saves to grades table
 */
export async function POST(request: NextRequest) {
    const auth = authenticateRequest(request, ["admin", "teacher"]);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const parsed = bulkGradeSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
                { status: 400 }
            );
        }

        const { class_id, assessment_type, max_score, records } = parsed.data;

        // Teacher class ownership check
        if (auth.user.role === "teacher") {
            const { data: cls } = await supabaseAdmin
                .from("classes")
                .select("teacher_id")
                .eq("class_id", class_id)
                .single();

            if (!cls || cls.teacher_id !== auth.user.userId) {
                return NextResponse.json(
                    { success: false, error: "Access denied. You are not assigned to this class." },
                    { status: 403 }
                );
            }
        }

        // Validate scores don't exceed max
        const invalidScores = records.filter((r) => r.score > max_score);
        if (invalidScores.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `${invalidScores.length} score(s) exceed max score of ${max_score}.`,
                },
                { status: 400 }
            );
        }

        const gradeRecords = records.map((r) => ({
            class_id,
            assessment_type,
            max_score,
            student_id: r.student_id,
            score: r.score,
        }));

        const { data, error } = await supabaseAdmin
            .from("grades")
            .insert(gradeRecords)
            .select();

        if (error) {
            return NextResponse.json(
                { success: false, error: formatDbError(error) },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
            message: `${records.length} grade records saved.`,
        });
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request body." },
            { status: 400 }
        );
    }
}
