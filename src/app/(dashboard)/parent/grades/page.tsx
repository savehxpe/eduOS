"use client";

import React from "react";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useFetch } from "@/lib/hooks";

interface ParentDashboardData {
    children: Array<{
        student: { first_name: string; last_name: string } | null;
        grades: Array<{
            grade_id: string;
            assessment_type: string;
            score: number;
            max_score: number;
            classes: { subjects: { subject_name: string } | null } | null;
        }>;
        metrics: { gpa: number };
    }>;
}

export default function ParentGradesPage() {
    const { data, loading, error, refetch } = useFetch<ParentDashboardData>("/api/analytics/dashboard");

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data?.children?.length) return <div className="p-8 text-center text-surface-400">No student data available.</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Grades</h1>
                <p className="text-sm text-surface-500 mt-1">Your children&apos;s academic grades</p>
            </div>

            {data.children.map((child, idx) => (
                <Card key={idx}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-surface-900">
                                {child.student?.first_name} {child.student?.last_name}
                            </h3>
                            <Badge variant={child.metrics.gpa >= 75 ? "success" : child.metrics.gpa >= 50 ? "warning" : "danger"}>
                                Avg: {child.metrics.gpa}%
                            </Badge>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-50 border-b border-surface-200">
                                    <th className="px-6 py-3 text-left font-medium text-surface-500">Subject</th>
                                    <th className="px-6 py-3 text-left font-medium text-surface-500">Assessment</th>
                                    <th className="px-6 py-3 text-left font-medium text-surface-500">Score</th>
                                    <th className="px-6 py-3 text-left font-medium text-surface-500">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {child.grades?.map((g) => {
                                    const pct = Math.round((g.score / g.max_score) * 100);
                                    return (
                                        <tr key={g.grade_id} className="border-b border-surface-100">
                                            <td className="px-6 py-3 font-medium text-surface-900">{g.classes?.subjects?.subject_name}</td>
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
                            </tbody>
                        </table>
                    </div>
                </Card>
            ))}
        </div>
    );
}
