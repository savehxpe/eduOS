/**
 * Run SQL migrations against Supabase using the service role key
 * This uses the Supabase PostgREST function endpoint
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://kjzfjadiwwkuhvmmlxci.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqemZqYWRpd3drdWh2bW1seGNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwNDE2MCwiZXhwIjoyMDg3ODgwMTYwfQ.irQqwqEFjbRc8VN-jf3d1E5OKtGi_h8up83FlTCRKK0';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Split SQL into individual statements and run them one at a time
function splitStatements(sql) {
    // Remove comments and split by semicolons, keeping meaningful statements
    const lines = sql.split('\n');
    let currentStatement = '';
    const statements = [];

    for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines and pure comment lines
        if (trimmed === '' || trimmed.startsWith('--')) continue;

        currentStatement += line + '\n';

        if (trimmed.endsWith(';')) {
            const stmt = currentStatement.trim();
            if (stmt && stmt !== ';') {
                statements.push(stmt);
            }
            currentStatement = '';
        }
    }

    if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
    }

    return statements;
}

async function runStatement(sql, index, total) {
    // Extract a short label from the SQL
    const firstLine = sql.split('\n')[0].trim().substring(0, 80);
    process.stdout.write(`  [${index + 1}/${total}] ${firstLine}...`);

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        // Fallback: try using admin schema query
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({ sql_query: sql }),
            });

            if (!res.ok) {
                console.log(' ❌');
                console.log(`    Error: ${error.message || await res.text()}`);
                return false;
            }
        } catch (e) {
            console.log(' ❌');
            console.log(`    Error: ${error.message}`);
            return false;
        }
    }

    console.log(' ✅');
    return true;
}

async function main() {
    console.log('🚀 eduOS Database Setup');
    console.log('=======================\n');

    // First, create an exec_sql function we can call via RPC
    console.log('📦 Setting up SQL execution function...');

    const setupRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql_query: 'SELECT 1' }),
    });

    if (!setupRes.ok) {
        console.log('ℹ️  exec_sql function not available, will try direct approach...\n');

        // Try using the Database Functions approach directly
        console.log('Creating tables via direct insert approach...');
        console.log('Please run the SQL manually in Supabase SQL Editor.\n');
        console.log('Here are step-by-step instructions:\n');
        console.log('1. Open: https://supabase.com/dashboard/project/kjzfjadiwwkuhvmmlxci/sql/new');
        console.log('2. Copy the contents of: supabase/migrations/001_schema.sql');
        console.log('3. Paste and click "Run"');
        console.log('4. Then do the same for: supabase/migrations/002_seed.sql');
        console.log('\nAlternatively, I will now try to insert data using the Supabase client...\n');
    }

    // Regardless of the RPC function, let's check if tables already exist
    console.log('🔍 Checking database state...');
    const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
        console.log('❌ Tables do not exist yet. You need to run the schema SQL first.');
        console.log('   Open the SQL Editor in Supabase and paste 001_schema.sql');
        console.log('   URL: https://supabase.com/dashboard/project/kjzfjadiwwkuhvmmlxci/sql/new\n');
        return;
    }

    if (existingUsers && existingUsers.length > 0) {
        console.log('✅ Tables exist and contain data. Database is already set up!\n');

        // Verify all tables
        const tables = ['users', 'students_profile', 'subjects', 'classes', 'enrollments', 'attendance', 'grades'];
        for (const table of tables) {
            const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
            console.log(`   📊 ${table}: ${count || 0} rows`);
        }
        return;
    }

    // Tables exist but are empty — let's seed data using the client
    console.log('📊 Tables exist. Seeding data...\n');

    // Insert users
    console.log('👥 Creating users...');
    const users = [
        { id: 'a0000000-0000-0000-0000-000000000001', role: 'admin', email: 'admin@eduos.school', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Sarah', last_name: 'Molefe' },
        { id: 'b0000000-0000-0000-0000-000000000001', role: 'teacher', email: 'thabo.nkosi@eduos.school', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Thabo', last_name: 'Nkosi' },
        { id: 'b0000000-0000-0000-0000-000000000002', role: 'teacher', email: 'lerato.dlamini@eduos.school', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Lerato', last_name: 'Dlamini' },
        { id: 'd0000000-0000-0000-0000-000000000001', role: 'parent', email: 'nthabiseng.mokoena@gmail.com', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Nthabiseng', last_name: 'Mokoena' },
        { id: 'd0000000-0000-0000-0000-000000000002', role: 'parent', email: 'sipho.khumalo@gmail.com', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Sipho', last_name: 'Khumalo' },
        { id: 'c0000000-0000-0000-0000-000000000001', role: 'student', email: 'kabelo.mokoena@eduos.school', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Kabelo', last_name: 'Mokoena' },
        { id: 'c0000000-0000-0000-0000-000000000002', role: 'student', email: 'palesa.khumalo@eduos.school', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Palesa', last_name: 'Khumalo' },
        { id: 'c0000000-0000-0000-0000-000000000003', role: 'student', email: 'tshepo.moloi@eduos.school', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Tshepo', last_name: 'Moloi' },
        { id: 'c0000000-0000-0000-0000-000000000004', role: 'student', email: 'lindiwe.sithole@eduos.school', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Lindiwe', last_name: 'Sithole' },
        { id: 'c0000000-0000-0000-0000-000000000005', role: 'student', email: 'mpho.maseko@eduos.school', password_hash: '$2b$12$2rA4KwX2F2MEki8y9BklBOAJxSnAbae7QB7G9nE3iuKdCCSUEbLD6', first_name: 'Mpho', last_name: 'Maseko' },
    ];

    const { error: usersError } = await supabase.from('users').upsert(users, { onConflict: 'email' });
    console.log(usersError ? `   ❌ ${usersError.message}` : '   ✅ 10 users created');

    // Insert student profiles
    console.log('🎓 Creating student profiles...');
    const profiles = [
        { student_id: 'c0000000-0000-0000-0000-000000000001', parent_id: 'd0000000-0000-0000-0000-000000000001', date_of_birth: '2010-03-15', enrollment_year: 2025 },
        { student_id: 'c0000000-0000-0000-0000-000000000002', parent_id: 'd0000000-0000-0000-0000-000000000002', date_of_birth: '2010-07-22', enrollment_year: 2025 },
        { student_id: 'c0000000-0000-0000-0000-000000000003', parent_id: null, date_of_birth: '2009-11-08', enrollment_year: 2024 },
        { student_id: 'c0000000-0000-0000-0000-000000000004', parent_id: null, date_of_birth: '2010-01-30', enrollment_year: 2025 },
        { student_id: 'c0000000-0000-0000-0000-000000000005', parent_id: 'd0000000-0000-0000-0000-000000000001', date_of_birth: '2011-06-12', enrollment_year: 2025 },
    ];
    const { error: profilesError } = await supabase.from('students_profile').upsert(profiles, { onConflict: 'student_id' });
    console.log(profilesError ? `   ❌ ${profilesError.message}` : '   ✅ 5 profiles created');

    // Insert subjects
    console.log('📚 Creating subjects...');
    const subjects = [
        { subject_id: 'e0000000-0000-0000-0000-000000000001', subject_code: 'MATH101', subject_name: 'Mathematics', credits: 4 },
        { subject_id: 'e0000000-0000-0000-0000-000000000002', subject_code: 'ENG101', subject_name: 'English Language', credits: 3 },
        { subject_id: 'e0000000-0000-0000-0000-000000000003', subject_code: 'SCI101', subject_name: 'Physical Science', credits: 4 },
        { subject_id: 'e0000000-0000-0000-0000-000000000004', subject_code: 'HIST101', subject_name: 'History', credits: 3 },
        { subject_id: 'e0000000-0000-0000-0000-000000000005', subject_code: 'SESOTHO', subject_name: 'Sesotho', credits: 3 },
    ];
    const { error: subjectsError } = await supabase.from('subjects').upsert(subjects, { onConflict: 'subject_code' });
    console.log(subjectsError ? `   ❌ ${subjectsError.message}` : '   ✅ 5 subjects created');

    // Insert classes
    console.log('🏫 Creating classes...');
    const classes = [
        { class_id: 'f0000000-0000-0000-0000-000000000001', subject_id: 'e0000000-0000-0000-0000-000000000001', teacher_id: 'b0000000-0000-0000-0000-000000000001', semester: 'Semester 1', academic_year: 2026 },
        { class_id: 'f0000000-0000-0000-0000-000000000002', subject_id: 'e0000000-0000-0000-0000-000000000002', teacher_id: 'b0000000-0000-0000-0000-000000000002', semester: 'Semester 1', academic_year: 2026 },
        { class_id: 'f0000000-0000-0000-0000-000000000003', subject_id: 'e0000000-0000-0000-0000-000000000003', teacher_id: 'b0000000-0000-0000-0000-000000000001', semester: 'Semester 1', academic_year: 2026 },
        { class_id: 'f0000000-0000-0000-0000-000000000004', subject_id: 'e0000000-0000-0000-0000-000000000004', teacher_id: 'b0000000-0000-0000-0000-000000000002', semester: 'Semester 1', academic_year: 2026 },
        { class_id: 'f0000000-0000-0000-0000-000000000005', subject_id: 'e0000000-0000-0000-0000-000000000005', teacher_id: 'b0000000-0000-0000-0000-000000000002', semester: 'Semester 1', academic_year: 2026 },
    ];
    const { error: classesError } = await supabase.from('classes').upsert(classes, { onConflict: 'class_id' });
    console.log(classesError ? `   ❌ ${classesError.message}` : '   ✅ 5 classes created');

    // Insert enrollments
    console.log('📋 Creating enrollments...');
    const enrollments = [
        { student_id: 'c0000000-0000-0000-0000-000000000001', class_id: 'f0000000-0000-0000-0000-000000000001', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000001', class_id: 'f0000000-0000-0000-0000-000000000002', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000001', class_id: 'f0000000-0000-0000-0000-000000000003', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000002', class_id: 'f0000000-0000-0000-0000-000000000001', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000002', class_id: 'f0000000-0000-0000-0000-000000000002', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000002', class_id: 'f0000000-0000-0000-0000-000000000004', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000003', class_id: 'f0000000-0000-0000-0000-000000000001', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000003', class_id: 'f0000000-0000-0000-0000-000000000003', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000003', class_id: 'f0000000-0000-0000-0000-000000000005', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000004', class_id: 'f0000000-0000-0000-0000-000000000002', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000004', class_id: 'f0000000-0000-0000-0000-000000000004', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000004', class_id: 'f0000000-0000-0000-0000-000000000005', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000005', class_id: 'f0000000-0000-0000-0000-000000000001', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000005', class_id: 'f0000000-0000-0000-0000-000000000002', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000005', class_id: 'f0000000-0000-0000-0000-000000000003', status: 'active' },
        { student_id: 'c0000000-0000-0000-0000-000000000005', class_id: 'f0000000-0000-0000-0000-000000000005', status: 'active' },
    ];
    const { error: enrollError } = await supabase.from('enrollments').upsert(enrollments, { onConflict: 'student_id,class_id' });
    console.log(enrollError ? `   ❌ ${enrollError.message}` : '   ✅ 16 enrollments created');

    // Insert attendance
    console.log('📅 Creating attendance records...');
    const attendance = [
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000001', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000002', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000003', date: '2026-02-16', status: 'late' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000001', date: '2026-02-17', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000002', date: '2026-02-17', status: 'absent' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000003', date: '2026-02-17', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-17', status: 'late' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000001', date: '2026-02-18', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000002', date: '2026-02-18', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000003', date: '2026-02-18', status: 'absent' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-18', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000001', date: '2026-02-23', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000002', date: '2026-02-23', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000003', date: '2026-02-23', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-23', status: 'absent' },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000001', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000002', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000004', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000001', date: '2026-02-18', status: 'absent' },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000002', date: '2026-02-18', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000004', date: '2026-02-18', status: 'late' },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-18', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000001', date: '2026-02-17', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000003', date: '2026-02-17', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-17', status: 'late' },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000001', date: '2026-02-24', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000003', date: '2026-02-24', status: 'absent' },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-24', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000004', student_id: 'c0000000-0000-0000-0000-000000000002', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000004', student_id: 'c0000000-0000-0000-0000-000000000004', date: '2026-02-16', status: 'absent' },
        { class_id: 'f0000000-0000-0000-0000-000000000004', student_id: 'c0000000-0000-0000-0000-000000000002', date: '2026-02-23', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000004', student_id: 'c0000000-0000-0000-0000-000000000004', date: '2026-02-23', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000003', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000004', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-16', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000003', date: '2026-02-23', status: 'late' },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000004', date: '2026-02-23', status: 'present' },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000005', date: '2026-02-23', status: 'present' },
    ];
    const { error: attError } = await supabase.from('attendance').upsert(attendance, { onConflict: 'class_id,student_id,date' });
    console.log(attError ? `   ❌ ${attError.message}` : `   ✅ ${attendance.length} attendance records created`);

    // Insert grades
    console.log('📝 Creating grades...');
    const grades = [
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000001', assessment_type: 'Assignment 1', score: 85, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000002', assessment_type: 'Assignment 1', score: 72, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000003', assessment_type: 'Assignment 1', score: 45, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000005', assessment_type: 'Assignment 1', score: 91, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000001', assessment_type: 'Test 1', score: 78, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000002', assessment_type: 'Test 1', score: 65, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000003', assessment_type: 'Test 1', score: 38, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000001', student_id: 'c0000000-0000-0000-0000-000000000005', assessment_type: 'Test 1', score: 88, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000001', assessment_type: 'Essay 1', score: 70, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000002', assessment_type: 'Essay 1', score: 82, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000004', assessment_type: 'Essay 1', score: 75, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000005', assessment_type: 'Essay 1', score: 68, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000001', assessment_type: 'Oral Exam', score: 80, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000002', assessment_type: 'Oral Exam', score: 90, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000004', assessment_type: 'Oral Exam', score: 85, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000002', student_id: 'c0000000-0000-0000-0000-000000000005', assessment_type: 'Oral Exam', score: 55, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000001', assessment_type: 'Lab Report 1', score: 88, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000003', assessment_type: 'Lab Report 1', score: 42, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000005', assessment_type: 'Lab Report 1', score: 76, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000001', assessment_type: 'Midterm', score: 92, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000003', assessment_type: 'Midterm', score: 35, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000003', student_id: 'c0000000-0000-0000-0000-000000000005', assessment_type: 'Midterm', score: 80, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000004', student_id: 'c0000000-0000-0000-0000-000000000002', assessment_type: 'Research Paper', score: 78, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000004', student_id: 'c0000000-0000-0000-0000-000000000004', assessment_type: 'Research Paper', score: 65, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000004', student_id: 'c0000000-0000-0000-0000-000000000002', assessment_type: 'Quiz 1', score: 85, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000004', student_id: 'c0000000-0000-0000-0000-000000000004', assessment_type: 'Quiz 1', score: 70, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000003', assessment_type: 'Composition', score: 55, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000004', assessment_type: 'Composition', score: 88, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000005', assessment_type: 'Composition', score: 72, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000003', assessment_type: 'Oral Test', score: 60, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000004', assessment_type: 'Oral Test', score: 92, max_score: 100 },
        { class_id: 'f0000000-0000-0000-0000-000000000005', student_id: 'c0000000-0000-0000-0000-000000000005', assessment_type: 'Oral Test', score: 78, max_score: 100 },
    ];
    const { error: gradesError } = await supabase.from('grades').insert(grades);
    console.log(gradesError ? `   ❌ ${gradesError.message}` : `   ✅ ${grades.length} grades created`);

    // Final verification
    console.log('\n📊 Final verification:');
    const tables = ['users', 'students_profile', 'subjects', 'classes', 'enrollments', 'attendance', 'grades'];
    for (const table of tables) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        console.log(`   ${table}: ${count || 0} rows`);
    }

    console.log('\n✅ Database setup complete!');
    console.log('\n🔑 Test accounts (all password: password123):');
    console.log('   Admin:   admin@eduos.school');
    console.log('   Teacher: thabo.nkosi@eduos.school');
    console.log('   Student: kabelo.mokoena@eduos.school');
    console.log('   Parent:  nthabiseng.mokoena@gmail.com');
}

main().catch(console.error);
