// ============================================================
// eduOS Type Definitions — matching MASTER_CONTEXT.md schema
// ============================================================

export type UserRole = "admin" | "teacher" | "student" | "parent";
export type AttendanceStatus = "present" | "absent" | "late";
export type EnrollmentStatus = "active" | "dropped";

export interface User {
    id: string;
    role: UserRole;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    created_at: string;
}

export interface StudentProfile {
    student_id: string;
    parent_id: string | null;
    date_of_birth: string | null;
    enrollment_year: number;
}

export interface Subject {
    subject_id: string;
    subject_code: string;
    subject_name: string;
    credits: number;
}

export interface Class {
    class_id: string;
    subject_id: string;
    teacher_id: string;
    semester: string;
    academic_year: number;
}

export interface ClassWithDetails extends Class {
    subjects?: Subject;
    users?: Pick<User, "first_name" | "last_name" | "email">;
}

export interface Enrollment {
    enrollment_id: string;
    student_id: string;
    class_id: string;
    status: EnrollmentStatus;
}

export interface EnrollmentWithStudent extends Enrollment {
    students_profile?: StudentProfile & {
        users?: Pick<User, "first_name" | "last_name" | "email">;
    };
}

export interface Attendance {
    attendance_id: string;
    class_id: string;
    student_id: string;
    date: string;
    status: AttendanceStatus;
}

export interface Grade {
    grade_id: string;
    class_id: string;
    student_id: string;
    assessment_type: string;
    score: number;
    max_score: number;
}

// Dashboard metric types
export interface DashboardMetrics {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalEnrollments: number;
    globalAttendanceRate: number;
    averageGPA: number;
    atRiskStudents: number;
}

export interface TeacherDashboardMetrics {
    classAverageGPA: number;
    totalAtRisk: number;
    dailyAttendanceRate: number;
    classes: ClassWithDetails[];
}

export interface StudentDashboardMetrics {
    attendance: Attendance[];
    grades: Grade[];
    attendanceRate: number;
    gpa: number;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
