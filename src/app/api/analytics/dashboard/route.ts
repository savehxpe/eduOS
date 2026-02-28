import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authenticateRequest } from "@/lib/api-auth";

/**
 * GET /api/analytics/dashboard
 * Returns aggregated metrics for UI rendering.
 * Per MASTER_CONTEXT Section 7: GET /api/analytics/dashboard
 */
export async function GET(request: NextRequest) {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;

    try {
        if (user.role === "admin") {
            return await getAdminDashboard();
        } else if (user.role === "teacher") {
            return await getTeacherDashboard(user.userId);
        } else if (user.role === "student") {
            return await getStudentDashboard(user.userId);
        } else if (user.role === "parent") {
            return await getParentDashboard(user.userId);
        }

        return NextResponse.json(
            { success: false, error: "Invalid role." },
            { status: 403 }
        );
    } catch (err) {
        console.error("Dashboard error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to load dashboard data." },
            { status: 500 }
        );
    }
}

async function getAdminDashboard() {
    const [
        { count: totalStudents },
        { count: totalTeachers },
        { count: totalClasses },
        { count: totalEnrollments },
        { data: attendanceData },
        { data: gradeData },
    ] = await Promise.all([
        supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("role", "teacher"),
        supabaseAdmin.from("classes").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabaseAdmin.from("attendance").select("status"),
        supabaseAdmin.from("grades").select("score, max_score"),
    ]);

    const totalAttendance = attendanceData?.length || 0;
    const presentCount = attendanceData?.filter(
        (a) => a.status === "present" || a.status === "late"
    ).length || 0;
    const globalAttendanceRate =
        totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const percentages = gradeData?.map((g) => (g.score / g.max_score) * 100) || [];
    const averageGPA =
        percentages.length > 0
            ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
            : 0;

    // At-risk students: attendance < 75% or average grade < 50%
    const { data: students } = await supabaseAdmin
        .from("students_profile")
        .select("student_id");

    let atRiskCount = 0;
    if (students) {
        for (const s of students) {
            const { data: sAttendance } = await supabaseAdmin
                .from("attendance")
                .select("status")
                .eq("student_id", s.student_id);

            const total = sAttendance?.length || 0;
            const present = sAttendance?.filter(
                (a) => a.status === "present" || a.status === "late"
            ).length || 0;
            const rate = total > 0 ? (present / total) * 100 : 100;

            const { data: sGrades } = await supabaseAdmin
                .from("grades")
                .select("score, max_score")
                .eq("student_id", s.student_id);

            const avgGrade =
                sGrades && sGrades.length > 0
                    ? sGrades.reduce((a, g) => a + (g.score / g.max_score) * 100, 0) / sGrades.length
                    : 100;

            if (rate < 75 || avgGrade < 50) {
                atRiskCount++;
            }
        }
    }

    return NextResponse.json({
        success: true,
        data: {
            role: "admin",
            metrics: {
                totalStudents: totalStudents || 0,
                totalTeachers: totalTeachers || 0,
                totalClasses: totalClasses || 0,
                totalEnrollments: totalEnrollments || 0,
                globalAttendanceRate,
                averageGPA,
                atRiskStudents: atRiskCount,
            },
        },
    });
}

async function getTeacherDashboard(teacherId: string) {
    const { data: classes } = await supabaseAdmin
        .from("classes")
        .select(`
      *,
      subjects (subject_name, subject_code)
    `)
        .eq("teacher_id", teacherId);

    const classIds = classes?.map((c) => c.class_id) || [];

    const [{ data: attendance }, { data: grades }, { data: enrollments }] =
        await Promise.all([
            supabaseAdmin.from("attendance").select("*").in("class_id", classIds),
            supabaseAdmin.from("grades").select("*").in("class_id", classIds),
            supabaseAdmin.from("enrollments").select("*").in("class_id", classIds).eq("status", "active"),
        ]);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayAttendance = attendance?.filter((a) => a.date === todayStr) || [];
    const todayPresent = todayAttendance.filter(
        (a) => a.status === "present" || a.status === "late"
    ).length;
    const dailyAttendanceRate =
        todayAttendance.length > 0
            ? Math.round((todayPresent / todayAttendance.length) * 100)
            : 0;

    const percentages = grades?.map((g) => (g.score / g.max_score) * 100) || [];
    const classAverageGPA =
        percentages.length > 0
            ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
            : 0;

    // Count at-risk students
    const studentIds = [...new Set(enrollments?.map((e) => e.student_id) || [])];
    let atRisk = 0;
    for (const sid of studentIds) {
        const sGrades = grades?.filter((g) => g.student_id === sid) || [];
        const avg =
            sGrades.length > 0
                ? sGrades.reduce((a, g) => a + (g.score / g.max_score) * 100, 0) / sGrades.length
                : 100;
        const sAtt = attendance?.filter((a) => a.student_id === sid) || [];
        const sPresent = sAtt.filter(
            (a) => a.status === "present" || a.status === "late"
        ).length;
        const sRate = sAtt.length > 0 ? (sPresent / sAtt.length) * 100 : 100;
        if (avg < 50 || sRate < 75) atRisk++;
    }

    return NextResponse.json({
        success: true,
        data: {
            role: "teacher",
            metrics: {
                classAverageGPA,
                totalAtRisk: atRisk,
                dailyAttendanceRate,
                totalClasses: classes?.length || 0,
                totalStudents: studentIds.length,
            },
            classes,
        },
    });
}

async function getStudentDashboard(studentId: string) {
    const [{ data: attendance }, { data: grades }, { data: enrollments }] =
        await Promise.all([
            supabaseAdmin
                .from("attendance")
                .select(`*, classes (subjects (subject_name))`)
                .eq("student_id", studentId)
                .order("date", { ascending: false }),
            supabaseAdmin
                .from("grades")
                .select(`*, classes (subjects (subject_name))`)
                .eq("student_id", studentId),
            supabaseAdmin
                .from("enrollments")
                .select(`*, classes (subjects (subject_name, subject_code), semester, academic_year)`)
                .eq("student_id", studentId)
                .eq("status", "active"),
        ]);

    const total = attendance?.length || 0;
    const present = attendance?.filter(
        (a) => a.status === "present" || a.status === "late"
    ).length || 0;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    const percentages = grades?.map((g) => (g.score / g.max_score) * 100) || [];
    const gpa =
        percentages.length > 0
            ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
            : 0;

    return NextResponse.json({
        success: true,
        data: {
            role: "student",
            metrics: { attendanceRate, gpa, totalClasses: enrollments?.length || 0 },
            attendance,
            grades,
            enrollments,
        },
    });
}

async function getParentDashboard(parentId: string) {
    // Get children
    const { data: children } = await supabaseAdmin
        .from("students_profile")
        .select(`
      student_id,
      users (id, first_name, last_name, email)
    `)
        .eq("parent_id", parentId);

    if (!children || children.length === 0) {
        return NextResponse.json({
            success: true,
            data: { role: "parent", children: [], message: "No students linked to your account." },
        });
    }

    const childData = await Promise.all(
        children.map(async (child) => {
            const [{ data: attendance }, { data: grades }] = await Promise.all([
                supabaseAdmin
                    .from("attendance")
                    .select(`*, classes (subjects (subject_name))`)
                    .eq("student_id", child.student_id)
                    .order("date", { ascending: false })
                    .limit(50),
                supabaseAdmin
                    .from("grades")
                    .select(`*, classes (subjects (subject_name))`)
                    .eq("student_id", child.student_id),
            ]);

            const total = attendance?.length || 0;
            const present = attendance?.filter(
                (a) => a.status === "present" || a.status === "late"
            ).length || 0;
            const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

            const percentages = grades?.map((g) => (g.score / g.max_score) * 100) || [];
            const gpa =
                percentages.length > 0
                    ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
                    : 0;

            return {
                student: child.users,
                metrics: { attendanceRate, gpa },
                recentAttendance: attendance?.slice(0, 10),
                grades,
            };
        })
    );

    return NextResponse.json({
        success: true,
        data: { role: "parent", children: childData },
    });
}
