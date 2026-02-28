import { z } from "zod";

// ============================================================
// AUTH SCHEMAS
// ============================================================
export const loginSchema = z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// ============================================================
// USER SCHEMAS
// ============================================================
export const createUserSchema = z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    first_name: z.string().min(1, "First name is required").max(100),
    last_name: z.string().min(1, "Last name is required").max(100),
    role: z.enum(["admin", "teacher", "student", "parent"]),
});

export const updateUserSchema = z.object({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    role: z.enum(["admin", "teacher", "student", "parent"]).optional(),
});

// ============================================================
// STUDENT PROFILE SCHEMAS
// ============================================================
export const studentProfileSchema = z.object({
    student_id: z.string().uuid(),
    parent_id: z.string().uuid().nullable().optional(),
    date_of_birth: z.string().optional(),
    enrollment_year: z.number().int().min(2000).max(2100),
});

// ============================================================
// SUBJECT SCHEMAS
// ============================================================
export const subjectSchema = z.object({
    subject_code: z.string().min(1, "Subject code is required").max(20),
    subject_name: z.string().min(1, "Subject name is required").max(100),
    credits: z.number().int().min(1).max(10),
});

// ============================================================
// CLASS SCHEMAS
// ============================================================
export const classSchema = z.object({
    subject_id: z.string().uuid("Valid subject is required"),
    teacher_id: z.string().uuid("Valid teacher is required"),
    semester: z.string().min(1, "Semester is required").max(20),
    academic_year: z.number().int().min(2000).max(2100),
});

// ============================================================
// ENROLLMENT SCHEMAS
// ============================================================
export const enrollmentSchema = z.object({
    student_id: z.string().uuid("Valid student is required"),
    class_id: z.string().uuid("Valid class is required"),
    status: z.enum(["active", "dropped"]).default("active"),
});

// ============================================================
// ATTENDANCE SCHEMAS
// ============================================================
export const attendanceSchema = z.object({
    class_id: z.string().uuid("Valid class is required"),
    student_id: z.string().uuid("Valid student is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    status: z.enum(["present", "absent", "late"]),
});

export const bulkAttendanceSchema = z.object({
    class_id: z.string().uuid("Valid class is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    records: z.array(
        z.object({
            student_id: z.string().uuid(),
            status: z.enum(["present", "absent", "late"]),
        })
    ),
});

// ============================================================
// GRADE SCHEMAS
// ============================================================
export const gradeSchema = z.object({
    class_id: z.string().uuid("Valid class is required"),
    student_id: z.string().uuid("Valid student is required"),
    assessment_type: z.string().min(1, "Assessment type is required").max(50),
    score: z.number().min(0, "Score must be non-negative"),
    max_score: z.number().min(1, "Max score must be at least 1"),
});

export const bulkGradeSchema = z.object({
    class_id: z.string().uuid("Valid class is required"),
    assessment_type: z.string().min(1).max(50),
    max_score: z.number().min(1),
    records: z.array(
        z.object({
            student_id: z.string().uuid(),
            score: z.number().min(0),
        })
    ),
});

// ============================================================
// TYPE EXPORTS
// ============================================================
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;
export type BulkGradeInput = z.infer<typeof bulkGradeSchema>;
