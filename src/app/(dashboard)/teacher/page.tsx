"use client";

import React from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch } from "@/lib/hooks";
import { TrendingUp, AlertTriangle, UserCheck, GraduationCap, BookOpen } from "lucide-react";
import Link from "next/link";

interface TeacherDashboardData {
    role: string;
    metrics: {
        classAverageGPA: number;
        totalAtRisk: number;
        dailyAttendanceRate: number;
        totalClasses: number;
        totalStudents: number;
    };
    classes: Array<{
        class_id: string;
        semester: string;
        academic_year: number;
        subjects: { subject_name: string; subject_code: string } | null;
    }>;
}

export default function TeacherDashboard() {
    const { data, loading, error, refetch } = useFetch<TeacherDashboardData>("/api/analytics/dashboard");

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data) return null;

    const { metrics, classes } = data;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Teacher Dashboard</h1>
                <p className="text-sm text-surface-500 mt-1">Your class performance overview</p>
            </div>

            {/* Top Widgets — per MASTER_CONTEXT Section 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Class Average GPA" value={`${metrics.classAverageGPA}%`}
                    icon={<TrendingUp className="h-6 w-6" />} color="blue" />
                <MetricCard title="At-Risk Students" value={metrics.totalAtRisk}
                    icon={<AlertTriangle className="h-6 w-6" />}
                    color={metrics.totalAtRisk > 0 ? "red" : "green"} />
                <MetricCard title="Daily Attendance" value={`${metrics.dailyAttendanceRate}%`}
                    icon={<UserCheck className="h-6 w-6" />} color="green" />
                <MetricCard title="Total Students" value={metrics.totalStudents}
                    icon={<GraduationCap className="h-6 w-6" />} color="purple" />
            </div>

            {/* My Classes */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary-600" />
                            <h3 className="text-sm font-semibold text-surface-900">My Classes</h3>
                        </div>
                        <Badge variant="info">{classes?.length || 0} classes</Badge>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="divide-y divide-surface-100">
                        {classes?.map((c) => (
                            <div key={c.class_id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors">
                                <div>
                                    <p className="font-medium text-surface-900">{c.subjects?.subject_name}</p>
                                    <p className="text-xs text-surface-400">{c.subjects?.subject_code} · {c.semester} {c.academic_year}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href="/teacher/attendance">
                                        <span className="px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer">
                                            Attendance
                                        </span>
                                    </Link>
                                    <Link href="/teacher/gradebook">
                                        <span className="px-3 py-1.5 text-xs font-medium bg-success-50 text-success-600 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                                            Gradebook
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {(!classes || classes.length === 0) && (
                            <div className="px-6 py-12 text-center text-surface-400">
                                No classes assigned yet.
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
