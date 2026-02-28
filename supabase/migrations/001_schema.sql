-- ============================================================
-- eduOS Database Schema
-- Strict adherence to MASTER_CONTEXT.md Section 4
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. STUDENTS_PROFILE TABLE
-- ============================================================
CREATE TABLE students_profile (
  student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date_of_birth DATE,
  enrollment_year INT NOT NULL
);

-- ============================================================
-- 3. SUBJECTS TABLE
-- ============================================================
CREATE TABLE subjects (
  subject_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  credits INT NOT NULL DEFAULT 1
);

-- ============================================================
-- 4. CLASSES TABLE
-- ============================================================
CREATE TABLE classes (
  class_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  semester VARCHAR(20) NOT NULL,
  academic_year INT NOT NULL
);

-- ============================================================
-- 5. ENROLLMENTS TABLE (Resolves M:N between students & classes)
-- ============================================================
CREATE TABLE enrollments (
  enrollment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students_profile(student_id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
  status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dropped')),
  UNIQUE(student_id, class_id)
);

-- ============================================================
-- 6. ATTENDANCE TABLE
-- ============================================================
CREATE TABLE attendance (
  attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students_profile(student_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  UNIQUE(class_id, student_id, date)
);

-- ============================================================
-- 7. GRADES TABLE
-- ============================================================
CREATE TABLE grades (
  grade_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students_profile(student_id) ON DELETE CASCADE,
  assessment_type VARCHAR(50) NOT NULL,
  score FLOAT NOT NULL,
  max_score FLOAT NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Admin: full access to all tables
CREATE POLICY admin_all_users ON users FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY admin_all_profiles ON students_profile FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY admin_all_subjects ON subjects FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY admin_all_classes ON classes FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY admin_all_enrollments ON enrollments FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY admin_all_attendance ON attendance FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY admin_all_grades ON grades FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Teacher: read subjects/users, write own class attendance/grades
CREATE POLICY teacher_read_users ON users FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
);

CREATE POLICY teacher_read_subjects ON subjects FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
);

CREATE POLICY teacher_own_classes ON classes FOR SELECT USING (
  teacher_id = auth.uid()
);

CREATE POLICY teacher_own_attendance ON attendance FOR ALL USING (
  class_id IN (SELECT class_id FROM classes WHERE teacher_id = auth.uid())
);

CREATE POLICY teacher_own_grades ON grades FOR ALL USING (
  class_id IN (SELECT class_id FROM classes WHERE teacher_id = auth.uid())
);

-- Student: read own data only
CREATE POLICY student_own_attendance ON attendance FOR SELECT USING (
  student_id = auth.uid()
);

CREATE POLICY student_own_grades ON grades FOR SELECT USING (
  student_id = auth.uid()
);

-- Parent: read child's data
CREATE POLICY parent_child_attendance ON attendance FOR SELECT USING (
  student_id IN (SELECT student_id FROM students_profile WHERE parent_id = auth.uid())
);

CREATE POLICY parent_child_grades ON grades FOR SELECT USING (
  student_id IN (SELECT student_id FROM students_profile WHERE parent_id = auth.uid())
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_subject ON classes(subject_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_class ON enrollments(class_id);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_grades_class ON grades(class_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_students_parent ON students_profile(parent_id);
