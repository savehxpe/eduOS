"use client";

import React from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch } from "@/lib/hooks";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

interface ClassItem {
    class_id: string;
    semester: string;
    academic_year: number;
    subjects: { subject_name: string; subject_code: string } | null;
    users: { first_name: string; last_name: string } | null;
}

export default function TeacherClassesPage() {
    const { data: classes, loading, error, refetch } = useFetch<ClassItem[]>("/api/classes");

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Classes</h1>
                <p className="text-sm text-surface-500 mt-1">Your assigned class sections</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes?.map((c) => (
                    <Card key={c.class_id} hoverable>
                        <CardBody>
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary-50 shrink-0">
                                    <GraduationCap className="h-6 w-6 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-surface-900 truncate">{c.subjects?.subject_name}</h3>
                                    <p className="text-xs text-surface-400 mt-0.5">{c.subjects?.subject_code}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge variant="info">{c.semester}</Badge>
                                        <span className="text-xs text-surface-500">{c.academic_year}</span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Link href="/teacher/attendance" className="flex-1">
                                            <span className="block w-full text-center px-3 py-2 text-xs font-medium bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center">
                                                Take Attendance
                                            </span>
                                        </Link>
                                        <Link href="/teacher/gradebook" className="flex-1">
                                            <span className="block w-full text-center px-3 py-2 text-xs font-medium bg-success-50 text-success-600 rounded-lg hover:bg-green-100 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center">
                                                Gradebook
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
                {(!classes || classes.length === 0) && (
                    <div className="col-span-3 text-center py-12 text-surface-400">No classes assigned.</div>
                )}
            </div>
        </div>
    );
}
