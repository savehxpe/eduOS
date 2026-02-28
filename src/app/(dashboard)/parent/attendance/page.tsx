"use client";

import React from "react";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/Badge";
import { useFetch } from "@/lib/hooks";

interface ParentDashboardData {
    children: Array<{
        student: { first_name: string; last_name: string } | null;
        recentAttendance: Array<{
            attendance_id: string;
            date: string;
            status: string;
            classes: { subjects: { subject_name: string } | null } | null;
        }>;
        metrics: { attendanceRate: number };
    }>;
}

export default function ParentAttendancePage() {
    const { data, loading, error, refetch } = useFetch<ParentDashboardData>("/api/analytics/dashboard");

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data?.children?.length) return <div className="p-8 text-center text-surface-400">No student data available.</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Attendance</h1>
                <p className="text-sm text-surface-500 mt-1">Your children&apos;s attendance records</p>
            </div>

            {data.children.map((child, idx) => (
                <Card key={idx}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-surface-900">
                                {child.student?.first_name} {child.student?.last_name}
                            </h3>
                            <Badge variant={child.metrics.attendanceRate >= 75 ? "success" : "danger"}>
                                {child.metrics.attendanceRate}% attendance
                            </Badge>
                        </div>
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
            ))}
        </div>
    );
}
