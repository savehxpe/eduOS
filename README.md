# eduOS — School Management Platform

A production-ready, role-based school management system built with **Next.js 16**, **Supabase**, and **Tailwind CSS v4**.

![eduOS](https://img.shields.io/badge/eduOS-School%20Management-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue)

## Features

### 4 User Roles (RBAC)
- **Admin** — Full CRUD on all entities, global reports & analytics
- **Teacher** — Attendance recording, gradebook management (own classes only)
- **Student** — View own grades & attendance
- **Parent** — View linked children's academic data

### Core Modules
- 🔐 **JWT Authentication** with bcrypt password hashing
- 📊 **Live Analytics Dashboard** with Recharts visualizations
- 📋 **Attendance Tracking** — Bulk record with Present/Late/Absent toggle
- 📝 **Gradebook** — Per-student score entry with live percentage calculation
- 👥 **User Management** — Create/search/filter users (Admin)
- 📚 **Subject & Class Management** — Full CRUD
- 🛡️ **RBAC Middleware** — Route protection per role
- ⚠️ **At-Risk Alerts** — Students with <75% attendance or <50% grades

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| Icons | Lucide React |
| Validation | Zod |

## Getting Started

### 1. Clone
```bash
git clone https://github.com/savehxpe/eduOS.git
cd eduOS
npm install
```

### 2. Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration:
   - Go to SQL Editor → paste contents of `supabase/migrations/001_schema.sql`
   - Execute
3. Copy your project URL and keys

### 3. Environment Variables
```bash
cp .env.local.example .env.local
```
Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secret-min-32-characters
```

### 4. Seed an Admin User
In the Supabase SQL Editor:
```sql
INSERT INTO users (id, role, email, password_hash, first_name, last_name)
VALUES (
  uuid_generate_v4(),
  'admin',
  'admin@school.edu',
  -- Password: admin123 (bcrypt hash)
  '$2a$12$LJ3d0gR6TJ7.3kMiIOVjUOQ2jxQk3Y15KVn.LqFGO8FjjVF3LgZNK',
  'System',
  'Administrator'
);
```

### 5. Run
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) and log in with `admin@school.edu` / `admin123`.

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout (AuthProvider)
│   ├── page.tsx                # Auto-redirect to role dashboard
│   ├── login/page.tsx          # Login form
│   ├── (dashboard)/            # Protected route group
│   │   ├── layout.tsx          # Sidebar + Topbar shell
│   │   ├── admin/              # Admin pages (dashboard, users, subjects, classes, reports)
│   │   ├── teacher/            # Teacher pages (dashboard, classes, attendance, gradebook)
│   │   ├── student/            # Student pages (dashboard, grades, attendance)
│   │   └── parent/             # Parent pages (dashboard, grades, attendance)
│   └── api/                    # API routes (RESTful JSON)
├── components/
│   ├── ui/                     # Button, Input, Card, Modal, Badge, MetricCard, Loading, ErrorBoundary
│   ├── layout/                 # Sidebar, Topbar
│   └── providers/              # AuthProvider
├── lib/
│   ├── supabase/               # client.ts, server.ts, admin.ts
│   ├── auth.ts                 # JWT + bcrypt helpers
│   ├── validators.ts           # Zod schemas
│   ├── types.ts                # TypeScript interfaces
│   ├── hooks.ts                # useFetch, apiPost
│   └── api-auth.ts             # API route authorization
└── middleware.ts                # Edge RBAC middleware
```

## Database Schema

7 tables with Row Level Security:
- `users` — Authentication + role
- `students_profile` — Student/parent link
- `subjects` — Academic subjects
- `classes` — Class sections (subject + teacher)
- `enrollments` — Student-class M:N
- `attendance` — Daily attendance per class
- `grades` — Assessment scores

## API Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/logout` | All | Clears auth cookie |
| GET/POST | `/api/users` | Admin | List/create users |
| GET/POST | `/api/subjects` | Admin/Teacher | List/create subjects |
| GET/POST | `/api/classes` | Admin/Teacher | List/create classes |
| GET | `/api/classes/[id]/students` | Admin/Teacher | Class roster |
| GET/POST | `/api/enrollments` | Admin | Manage enrollments |
| GET/POST | `/api/attendance` | Admin/Teacher | Bulk attendance |
| GET | `/api/attendance/student/[id]` | All (own data) | Student history |
| POST | `/api/grades` | Admin/Teacher | Bulk grade entry |
| GET | `/api/grades/class/[id]` | Admin/Teacher | Class gradebook |
| GET | `/api/analytics/dashboard` | All (role-specific) | Dashboard metrics |

## License

MIT
