"use client";

import React from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch } from "@/lib/hooks";
import {
    Users,
    GraduationCap,
    BookOpen,
    UserCheck,
    TrendingUp,
    AlertTriangle,
    BarChart3,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
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

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
    const { data, loading, error, refetch } = useFetch<AdminDashboardData>(
        "/api/analytics/dashboard"
    );

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data) return null;

    const { metrics } = data;

    const attendancePieData = [
        { name: "Present", value: metrics.globalAttendanceRate },
        { name: "Absent", value: 100 - metrics.globalAttendanceRate },
    ];

    const performanceData = [
        { name: "Students", count: metrics.totalStudents },
        { name: "Teachers", count: metrics.totalTeachers },
        { name: "Classes", count: metrics.totalClasses },
        { name: "Enrollments", count: metrics.totalEnrollments },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Admin Dashboard</h1>
                <p className="text-sm text-surface-500 mt-1">
                    Global school performance overview
                </p>
            </div>

            {/* Top Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Enrollments"
                    value={metrics.totalEnrollments}
                    icon={<UserCheck className="h-6 w-6" />}
                    color="blue"
                    subtitle="Active enrollments"
                />
                <MetricCard
                    title="Attendance Rate"
                    value={`${metrics.globalAttendanceRate}%`}
                    icon={<TrendingUp className="h-6 w-6" />}
                    color="green"
                    subtitle="Global average"
                />
                <MetricCard
                    title="Faculty Count"
                    value={metrics.totalTeachers}
                    icon={<Users className="h-6 w-6" />}
                    color="purple"
                    subtitle="Total teachers"
                />
                <MetricCard
                    title="At-Risk Students"
                    value={metrics.atRiskStudents}
                    icon={<AlertTriangle className="h-6 w-6" />}
                    color={metrics.atRiskStudents > 0 ? "red" : "green"}
                    subtitle="Attendance < 75% or Grade < 50%"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* School Overview Bar Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary-600" />
                            <h3 className="text-sm font-semibold text-surface-900">
                                School Overview
                            </h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: "#64748b" }}
                                />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#3b82f6"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                {/* Attendance Pie Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary-600" />
                            <h3 className="text-sm font-semibold text-surface-900">
                                Global Attendance
                            </h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={attendancePieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {attendancePieData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary-50">
                                <BookOpen className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-sm text-surface-500">Total Classes</p>
                                <p className="text-xl font-bold text-surface-900">
                                    {metrics.totalClasses}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-success-50">
                                <GraduationCap className="h-5 w-5 text-success-600" />
                            </div>
                            <div>
                                <p className="text-sm text-surface-500">Total Students</p>
                                <p className="text-xl font-bold text-surface-900">
                                    {metrics.totalStudents}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-warning-50">
                                <TrendingUp className="h-5 w-5 text-warning-600" />
                            </div>
                            <div>
                                <p className="text-sm text-surface-500">Average Grade</p>
                                <p className="text-xl font-bold text-surface-900">
                                    {metrics.averageGPA}%
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
