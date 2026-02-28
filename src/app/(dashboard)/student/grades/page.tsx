"use client";

import React from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch } from "@/lib/hooks";

interface StudentDashboardData {
    grades: Array<{
        grade_id: string;
        assessment_type: string;
        score: number;
        max_score: number;
        classes: { subjects: { subject_name: string } | null } | null;
    }>;
    metrics: { gpa: number };
}

export default function StudentGradesPage() {
    const { data, loading, error, refetch } = useFetch<StudentDashboardData>("/api/analytics/dashboard");

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data) return null;

    const { grades, metrics } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">My Grades</h1>
                    <p className="text-sm text-surface-500 mt-1">Your academic performance</p>
                </div>
                <Badge variant={metrics.gpa >= 75 ? "success" : metrics.gpa >= 50 ? "warning" : "danger"} size="md">
                    Average: {metrics.gpa}%
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-sm font-semibold text-surface-900">All Grades</h3>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-50 border-b border-surface-200">
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Subject</th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Assessment</th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Score</th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades?.map((g) => {
                                const pct = Math.round((g.score / g.max_score) * 100);
                                return (
                                    <tr key={g.grade_id} className="border-b border-surface-100 hover:bg-surface-50">
                                        <td className="px-6 py-3 font-medium text-surface-900">
                                            {g.classes?.subjects?.subject_name}
                                        </td>
                                        <td className="px-6 py-3 text-surface-600">{g.assessment_type}</td>
                                        <td className="px-6 py-3 text-surface-700">{g.score}/{g.max_score}</td>
                                        <td className="px-6 py-3">
                                            <span className={`font-bold ${pct >= 75 ? "text-success-600" : pct >= 50 ? "text-warning-600" : "text-danger-600"}`}>
                                                {pct}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!grades || grades.length === 0) && (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-surface-400">No grades recorded yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
