"use client";

import React from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch } from "@/lib/hooks";
import { useAuth } from "@/components/providers/AuthProvider";

interface AttendanceData {
    records: Array<{
        attendance_id: string;
        date: string;
        status: string;
        classes: { subjects: { subject_name: string; subject_code: string } | null } | null;
    }>;
    summary: { total: number; present: number; late: number; absent: number; attendanceRate: number };
}

export default function StudentAttendancePage() {
    const { user } = useAuth();
    const { data, loading, error, refetch } = useFetch<AttendanceData>(
        `/api/attendance/student/${user?.id}`
    );

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data) return null;

    const { records, summary } = data;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Attendance</h1>
                <p className="text-sm text-surface-500 mt-1">Your attendance history across all classes</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card><CardBody>
                    <p className="text-sm text-surface-500">Total</p>
                    <p className="text-2xl font-bold text-surface-900">{summary.total}</p>
                </CardBody></Card>
                <Card><CardBody>
                    <p className="text-sm text-surface-500">Present</p>
                    <p className="text-2xl font-bold text-success-600">{summary.present}</p>
                </CardBody></Card>
                <Card><CardBody>
                    <p className="text-sm text-surface-500">Late</p>
                    <p className="text-2xl font-bold text-warning-600">{summary.late}</p>
                </CardBody></Card>
                <Card><CardBody>
                    <p className="text-sm text-surface-500">Absent</p>
                    <p className="text-2xl font-bold text-danger-600">{summary.absent}</p>
                </CardBody></Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-surface-900">Attendance History</h3>
                        <Badge variant={summary.attendanceRate >= 75 ? "success" : "danger"}>
                            {summary.attendanceRate}% overall
                        </Badge>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-50 border-b border-surface-200">
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Date</th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Subject</th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r) => (
                                <tr key={r.attendance_id} className="border-b border-surface-100 hover:bg-surface-50">
                                    <td className="px-6 py-3 text-surface-700">{new Date(r.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-3 text-surface-900 font-medium">
                                        {r.classes?.subjects?.subject_name}
                                    </td>
                                    <td className="px-6 py-3">
                                        <Badge variant={r.status === "present" ? "success" : r.status === "late" ? "warning" : "danger"}>
                                            {r.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
