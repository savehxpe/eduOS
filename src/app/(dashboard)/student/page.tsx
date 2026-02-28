"use client";

import React from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch } from "@/lib/hooks";
import { TrendingUp, Calendar, BookOpen, BarChart3 } from "lucide-react";

interface StudentDashboardData {
    role: string;
    metrics: { attendanceRate: number; gpa: number; totalClasses: number };
    attendance: Array<{
        attendance_id: string;
        date: string;
        status: string;
        classes: { subjects: { subject_name: string } | null } | null;
    }>;
    grades: Array<{
        grade_id: string;
        assessment_type: string;
        score: number;
        max_score: number;
        classes: { subjects: { subject_name: string } | null } | null;
    }>;
    enrollments: Array<{
        enrollment_id: string;
        classes: {
            subjects: { subject_name: string; subject_code: string } | null;
            semester: string;
            academic_year: number;
        } | null;
    }>;
}

export default function StudentDashboard() {
    const { data, loading, error, refetch } = useFetch<StudentDashboardData>("/api/analytics/dashboard");

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data) return null;

    const { metrics, attendance, grades, enrollments } = data;

    const statusColor: Record<string, "green" | "yellow" | "red"> = {
        present: "green",
        late: "yellow",
        absent: "red",
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Student Dashboard</h1>
                <p className="text-sm text-surface-500 mt-1">Your academic overview</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard title="Attendance Rate" value={`${metrics.attendanceRate}%`}
                    icon={<Calendar className="h-6 w-6" />}
                    color={metrics.attendanceRate >= 75 ? "green" : "red"} />
                <MetricCard title="Average Grade" value={`${metrics.gpa}%`}
                    icon={<TrendingUp className="h-6 w-6" />}
                    color={metrics.gpa >= 50 ? "blue" : "red"} />
                <MetricCard title="Enrolled Classes" value={metrics.totalClasses}
                    icon={<BookOpen className="h-6 w-6" />} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Grades */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary-600" />
                            <h3 className="text-sm font-semibold text-surface-900">Recent Grades</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0">
                        <div className="divide-y divide-surface-100 max-h-[400px] overflow-y-auto">
                            {grades?.slice(0, 10).map((g) => {
                                const pct = Math.round((g.score / g.max_score) * 100);
                                return (
                                    <div key={g.grade_id} className="flex items-center justify-between px-6 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-surface-900">
                                                {g.classes?.subjects?.subject_name}
                                            </p>
                                            <p className="text-xs text-surface-400">{g.assessment_type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${pct >= 75 ? "text-success-600" : pct >= 50 ? "text-warning-600" : "text-danger-600"}`}>
                                                {g.score}/{g.max_score}
                                            </p>
                                            <p className="text-xs text-surface-400">{pct}%</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!grades || grades.length === 0) && (
                                <div className="px-6 py-12 text-center text-surface-400">No grades yet.</div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Recent Attendance */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary-600" />
                            <h3 className="text-sm font-semibold text-surface-900">Recent Attendance</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0">
                        <div className="divide-y divide-surface-100 max-h-[400px] overflow-y-auto">
                            {attendance?.slice(0, 10).map((a) => (
                                <div key={a.attendance_id} className="flex items-center justify-between px-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <StatusDot status={statusColor[a.status] || "green"} />
                                        <div>
                                            <p className="text-sm font-medium text-surface-900">
                                                {a.classes?.subjects?.subject_name}
                                            </p>
                                            <p className="text-xs text-surface-400">
                                                {new Date(a.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={a.status === "present" ? "success" : a.status === "late" ? "warning" : "danger"}>
                                        {a.status}
                                    </Badge>
                                </div>
                            ))}
                            {(!attendance || attendance.length === 0) && (
                                <div className="px-6 py-12 text-center text-surface-400">No attendance records yet.</div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Enrolled Classes */}
            <Card>
                <CardHeader>
                    <h3 className="text-sm font-semibold text-surface-900">My Enrolled Classes</h3>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="divide-y divide-surface-100">
                        {enrollments?.map((e) => (
                            <div key={e.enrollment_id} className="flex items-center justify-between px-6 py-3">
                                <div>
                                    <p className="text-sm font-medium text-surface-900">
                                        {e.classes?.subjects?.subject_name}
                                    </p>
                                    <p className="text-xs text-surface-400">{e.classes?.subjects?.subject_code}</p>
                                </div>
                                <Badge variant="info">{e.classes?.semester} {e.classes?.academic_year}</Badge>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
