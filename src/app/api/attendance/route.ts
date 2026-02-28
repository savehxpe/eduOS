import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest, formatDbError } from "@/lib/api-auth";
import { bulkAttendanceSchema } from "@/lib/validators";

/**
 * POST /api/attendance
 * Bulk inserts daily attendance records.
 * Per MASTER_CONTEXT Section 7: POST /api/attendance
 * Workflow: Teacher selects class + date → toggles status → system saves
 */
export async function POST(request: NextRequest) {
    const auth = await authenticateRequest(request, ["admin", "teacher"]);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const parsed = bulkAttendanceSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
                { status: 400 }
            );
        }

        const { class_id, date, records } = parsed.data;

        // If teacher, verify class ownership
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

        // Build upsert records
        const attendanceRecords = records.map((r) => ({
            class_id,
            date,
            student_id: r.student_id,
            status: r.status,
        }));

        // Upsert (update if exists for same class+student+date)
        const { data, error } = await supabaseAdmin
            .from("attendance")
            .upsert(attendanceRecords, {
                onConflict: "class_id,student_id,date",
            })
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
            message: `${records.length} attendance records saved.`,
        });
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request body." },
            { status: 400 }
        );
    }
}

/**
 * GET /api/attendance
 * Retrieve attendance records filtered by class_id and/or date.
 */
export async function GET(request: NextRequest) {
    const auth = await authenticateRequest(request, ["admin", "teacher"]);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class_id");
    const date = searchParams.get("date");

    let query = supabaseAdmin
        .from("attendance")
        .select(`
      *,
      students_profile (
        student_id,
        users (first_name, last_name)
      )
    `)
        .order("date", { ascending: false });

    if (classId) query = query.eq("class_id", classId);
    if (date) query = query.eq("date", date);

    // Teachers see only their classes
    if (auth.user.role === "teacher") {
        const { data: teacherClasses } = await supabaseAdmin
            .from("classes")
            .select("class_id")
            .eq("teacher_id", auth.user.userId);

        const classIds = teacherClasses?.map((c) => c.class_id) || [];
        query = query.in("class_id", classIds);
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
