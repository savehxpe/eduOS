"use client";

import React, { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch, apiPost } from "@/lib/hooks";
import { Plus, BookOpen } from "lucide-react";
import type { Subject } from "@/lib/types";

export default function SubjectsPage() {
    const { data: subjects, loading, error, refetch } = useFetch<Subject[]>("/api/subjects");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ subject_code: "", subject_name: "", credits: 3 });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.subject_code.trim()) errors.subject_code = "Subject code is required.";
        if (!formData.subject_name.trim()) errors.subject_name = "Subject name is required.";
        if (formData.credits < 1 || formData.credits > 10) errors.credits = "Credits must be 1-10.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setSubmitError("");
        const result = await apiPost("/api/subjects", formData);
        if (result.success) {
            setShowModal(false);
            setFormData({ subject_code: "", subject_name: "", credits: 3 });
            refetch();
        } else {
            setSubmitError(result.error || "Failed to create subject.");
        }
        setSubmitting(false);
    };

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Subjects</h1>
                    <p className="text-sm text-surface-500 mt-1">Manage academic subjects</p>
                </div>
                <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>
                    Add Subject
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects?.map((s) => (
                    <Card key={s.subject_id} hoverable>
                        <div className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="p-2 rounded-lg bg-primary-50">
                                    <BookOpen className="h-5 w-5 text-primary-600" />
                                </div>
                                <span className="text-xs font-mono bg-surface-100 text-surface-600 px-2 py-1 rounded">
                                    {s.subject_code}
                                </span>
                            </div>
                            <h3 className="mt-3 font-semibold text-surface-900">{s.subject_name}</h3>
                            <p className="text-sm text-surface-500 mt-1">{s.credits} credit{s.credits !== 1 ? "s" : ""}</p>
                        </div>
                    </Card>
                ))}
                {(!subjects || subjects.length === 0) && (
                    <div className="col-span-3 text-center py-12 text-surface-400">
                        No subjects found. Create one to get started.
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Subject">
                {submitError && <div className="mb-4"><ErrorMessage message={submitError} /></div>}
                <form onSubmit={handleCreate} className="space-y-4" noValidate>
                    <Input label="Subject Code" placeholder="e.g., MATH101" value={formData.subject_code}
                        onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                        error={formErrors.subject_code} disabled={submitting} />
                    <Input label="Subject Name" placeholder="e.g., Mathematics" value={formData.subject_name}
                        onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                        error={formErrors.subject_name} disabled={submitting} />
                    <Input label="Credits" type="number" min={1} max={10} value={formData.credits.toString()}
                        onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 1 })}
                        error={formErrors.credits} disabled={submitting} />
                    <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                        <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                        <Button type="submit" loading={submitting}>Create Subject</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
