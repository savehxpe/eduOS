"use client";

import React, { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch, apiPost } from "@/lib/hooks";
import { Plus, GraduationCap, Users } from "lucide-react";
import type { Subject } from "@/lib/types";

interface ClassItem {
    class_id: string;
    subject_id: string;
    teacher_id: string;
    semester: string;
    academic_year: number;
    subjects: { subject_name: string; subject_code: string } | null;
    users: { first_name: string; last_name: string; email: string } | null;
}

interface Teacher {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export default function ClassesPage() {
    const { data: classes, loading, error, refetch } = useFetch<ClassItem[]>("/api/classes");
    const { data: subjects } = useFetch<Subject[]>("/api/subjects");
    const { data: teachers } = useFetch<Teacher[]>("/api/users?role=teacher");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        subject_id: "",
        teacher_id: "",
        semester: "",
        academic_year: new Date().getFullYear(),
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.subject_id) errors.subject_id = "Select a subject.";
        if (!formData.teacher_id) errors.teacher_id = "Select a teacher.";
        if (!formData.semester.trim()) errors.semester = "Semester is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setSubmitError("");
        const result = await apiPost("/api/classes", formData);
        if (result.success) {
            setShowModal(false);
            setFormData({ subject_id: "", teacher_id: "", semester: "", academic_year: new Date().getFullYear() });
            refetch();
        } else {
            setSubmitError(result.error || "Failed to create class.");
        }
        setSubmitting(false);
    };

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Classes</h1>
                    <p className="text-sm text-surface-500 mt-1">Manage class sections and assignments</p>
                </div>
                <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>
                    Add Class
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <p className="text-sm font-medium text-surface-500">
                        {classes?.length || 0} class section{(classes?.length || 0) !== 1 ? "s" : ""}
                    </p>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-50 border-b border-surface-200">
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Subject</th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Teacher</th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Semester</th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">Year</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes?.map((c) => (
                                <tr key={c.class_id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary-500" />
                                            <div>
                                                <p className="font-medium text-surface-900">{c.subjects?.subject_name}</p>
                                                <p className="text-xs text-surface-400">{c.subjects?.subject_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-surface-400" />
                                            <span className="text-surface-700">
                                                {c.users?.first_name} {c.users?.last_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="info">{c.semester}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-surface-600">{c.academic_year}</td>
                                </tr>
                            ))}
                            {(!classes || classes.length === 0) && (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-surface-400">No classes found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Class Section">
                {submitError && <div className="mb-4"><ErrorMessage message={submitError} /></div>}
                <form onSubmit={handleCreate} className="space-y-4" noValidate>
                    <Select label="Subject" placeholder="Select a subject"
                        options={subjects?.map((s) => ({ value: s.subject_id, label: `${s.subject_code} — ${s.subject_name}` })) || []}
                        value={formData.subject_id}
                        onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                        error={formErrors.subject_id} />
                    <Select label="Teacher" placeholder="Select a teacher"
                        options={teachers?.map((t) => ({ value: t.id, label: `${t.first_name} ${t.last_name}` })) || []}
                        value={formData.teacher_id}
                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                        error={formErrors.teacher_id} />
                    <Input label="Semester" placeholder="e.g., Fall 2026" value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        error={formErrors.semester} disabled={submitting} />
                    <Input label="Academic Year" type="number" min={2000} max={2100}
                        value={formData.academic_year.toString()}
                        onChange={(e) => setFormData({ ...formData, academic_year: parseInt(e.target.value) || 2026 })}
                        disabled={submitting} />
                    <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                        <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                        <Button type="submit" loading={submitting}>Create Class</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
