"use client";

import React from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch } from "@/lib/hooks";
import { TrendingUp, Calendar, Users } from "lucide-react";

interface ChildData {
    student: { id: string; first_name: string; last_name: string; email: string } | null;
    metrics: { attendanceRate: number; gpa: number };
    recentAttendance: Array<{
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
}

interface ParentDashboardData {
    role: string;
    children: ChildData[];
    message?: string;
}

export default function ParentDashboard() {
    const { data, loading, error, refetch } = useFetch<ParentDashboardData>("/api/analytics/dashboard");

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data) return null;

    if (data.message || !data.children?.length) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-surface-900">Parent Dashboard</h1>
                <Card><CardBody>
                    <div className="text-center py-12 text-surface-400">
                        <Users className="h-12 w-12 mx-auto mb-4 text-surface-300" />
                        <p>No students linked to your account yet.</p>
                        <p className="text-sm mt-1">Contact the administrator to link your children.</p>
                    </div>
                </CardBody></Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Parent Dashboard</h1>
                <p className="text-sm text-surface-500 mt-1">Monitor your children&apos;s academic progress</p>
            </div>

            {data.children.map((child, idx) => (
                <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                            {child.student?.first_name?.[0]}{child.student?.last_name?.[0]}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-surface-900">
                                {child.student?.first_name} {child.student?.last_name}
                            </h2>
                            <p className="text-xs text-surface-400">{child.student?.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MetricCard title="Attendance Rate" value={`${child.metrics.attendanceRate}%`}
                            icon={<Calendar className="h-6 w-6" />}
                            color={child.metrics.attendanceRate >= 75 ? "green" : "red"} />
                        <MetricCard title="Average Grade" value={`${child.metrics.gpa}%`}
                            icon={<TrendingUp className="h-6 w-6" />}
                            color={child.metrics.gpa >= 50 ? "blue" : "red"} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Attendance */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-sm font-semibold text-surface-900">Recent Attendance</h3>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="divide-y divide-surface-100">
                                    {child.recentAttendance?.map((a) => (
                                        <div key={a.attendance_id} className="flex items-center justify-between px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <StatusDot status={a.status === "present" ? "green" : a.status === "late" ? "yellow" : "red"} />
                                                <div>
                                                    <p className="text-sm font-medium text-surface-900">{a.classes?.subjects?.subject_name}</p>
                                                    <p className="text-xs text-surface-400">{new Date(a.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Badge variant={a.status === "present" ? "success" : a.status === "late" ? "warning" : "danger"}>
                                                {a.status}
                                            </Badge>
                                        </div>
                                    ))}
                                    {(!child.recentAttendance || child.recentAttendance.length === 0) && (
                                        <div className="px-6 py-8 text-center text-surface-400 text-sm">No records yet.</div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Grades */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-sm font-semibold text-surface-900">Grades</h3>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="divide-y divide-surface-100">
                                    {child.grades?.slice(0, 10).map((g) => {
                                        const pct = Math.round((g.score / g.max_score) * 100);
                                        return (
                                            <div key={g.grade_id} className="flex items-center justify-between px-6 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-surface-900">{g.classes?.subjects?.subject_name}</p>
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
                                    {(!child.grades || child.grades.length === 0) && (
                                        <div className="px-6 py-8 text-center text-surface-400 text-sm">No grades yet.</div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            ))}
        </div>
    );
}
