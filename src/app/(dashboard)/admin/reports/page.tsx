"use client";

import React from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch } from "@/lib/hooks";
import { BarChart3, Users, TrendingUp, GraduationCap } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line,
} from "recharts";

interface AdminDashboardData {
    role: string;
    metrics: {
        totalStudents: number;
        totalTeachers: number;
        totalClasses: number;
        totalEnrollments: number;
        globalAttendanceRate: number;
        averageGPA: number;
        atRiskStudents: number;
    };
}

export default function AdminReportsPage() {
    const { data, loading, error, refetch } = useFetch<AdminDashboardData>("/api/analytics/dashboard");

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data) return null;

    const { metrics } = data;

    // Simulated departmental data from actual metrics
    const departmentData = [
        { name: "Overall", attendance: metrics.globalAttendanceRate, grades: metrics.averageGPA },
    ];

    const enrollmentTrend = [
        { month: "Current", enrollments: metrics.totalEnrollments },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Reports & Analytics</h1>
                <p className="text-sm text-surface-500 mt-1">School-wide performance reports</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Students" value={metrics.totalStudents} icon={<GraduationCap className="h-6 w-6" />} color="blue" />
                <MetricCard title="Teachers" value={metrics.totalTeachers} icon={<Users className="h-6 w-6" />} color="purple" />
                <MetricCard title="Attendance" value={`${metrics.globalAttendanceRate}%`} icon={<TrendingUp className="h-6 w-6" />} color="green" />
                <MetricCard title="Avg Grade" value={`${metrics.averageGPA}%`} icon={<BarChart3 className="h-6 w-6" />} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-sm font-semibold text-surface-900">Performance Overview</h3>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={departmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                                <Bar dataKey="attendance" fill="#22c55e" name="Attendance %" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="grades" fill="#3b82f6" name="Avg Grade %" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-sm font-semibold text-surface-900">Enrollment Trend</h3>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={enrollmentTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                                <Line type="monotone" dataKey="enrollments" stroke="#3b82f6" strokeWidth={2} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
