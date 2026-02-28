"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch, apiPost } from "@/lib/hooks";
import { Save, ClipboardList } from "lucide-react";

interface ClassItem {
    class_id: string;
    subjects: { subject_name: string; subject_code: string } | null;
}

interface StudentRoster {
    enrollment_id: string;
    student_id: string;
    students_profile: {
        student_id: string;
        users: { id: string; first_name: string; last_name: string; email: string } | null;
    } | null;
}

export default function TeacherGradebookPage() {
    const { data: classes, loading: classesLoading } = useFetch<ClassItem[]>("/api/classes");
    const [selectedClass, setSelectedClass] = useState("");
    const [assessmentType, setAssessmentType] = useState("");
    const [maxScore, setMaxScore] = useState("100");
    const [roster, setRoster] = useState<StudentRoster[]>([]);
    const [rosterLoading, setRosterLoading] = useState(false);
    const [scores, setScores] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveError, setSaveError] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!selectedClass) return;
        setRosterLoading(true);
        fetch(`/api/classes/${selectedClass}/students`)
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    setRoster(json.data || []);
                    const initial: Record<string, string> = {};
                    json.data?.forEach((s: StudentRoster) => {
                        initial[s.student_id] = "";
                    });
                    setScores(initial);
                }
            })
            .catch(() => setRoster([]))
            .finally(() => setRosterLoading(false));
    }, [selectedClass]);

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!assessmentType.trim()) errors.assessmentType = "Assessment type is required.";
        if (!maxScore || parseFloat(maxScore) < 1) errors.maxScore = "Max score must be at least 1.";

        // Check all scores
        const maxVal = parseFloat(maxScore);
        Object.entries(scores).forEach(([studentId, score]) => {
            if (score === "") errors[`score_${studentId}`] = "Score required.";
            else if (parseFloat(score) > maxVal) errors[`score_${studentId}`] = `Exceeds max (${maxVal}).`;
            else if (parseFloat(score) < 0) errors[`score_${studentId}`] = "Score cannot be negative.";
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        setSaveMessage("");
        setSaveError("");

        const records = Object.entries(scores).map(([student_id, score]) => ({
            student_id,
            score: parseFloat(score),
        }));

        const result = await apiPost<{ message?: string }>("/api/grades", {
            class_id: selectedClass,
            assessment_type: assessmentType,
            max_score: parseFloat(maxScore),
            records,
        });

        if (result.success) {
            setSaveMessage("Grades saved successfully!");
        } else {
            setSaveError(result.error || "Failed to save grades.");
        }
        setSaving(false);
    };

    if (classesLoading) return <PageLoader />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Gradebook</h1>
                <p className="text-sm text-surface-500 mt-1">
                    Input and manage assessment scores
                </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                    label="Select Class"
                    placeholder="Choose a class..."
                    options={
                        classes?.map((c) => ({
                            value: c.class_id,
                            label: `${c.subjects?.subject_code} — ${c.subjects?.subject_name}`,
                        })) || []
                    }
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                />
                <Input
                    label="Assessment Type"
                    placeholder="e.g., Midterm, Quiz 1"
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    error={formErrors.assessmentType}
                />
                <Input
                    label="Max Score"
                    type="number"
                    min={1}
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    error={formErrors.maxScore}
                />
            </div>

            {selectedClass && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-primary-600" />
                                <p className="text-sm font-medium text-surface-900">
                                    Enter Scores ({roster.length} students)
                                </p>
                            </div>
                            <Button
                                icon={<Save className="h-4 w-4" />}
                                onClick={handleSave}
                                loading={saving}
                                disabled={roster.length === 0}
                            >
                                Save Grades
                            </Button>
                        </div>
                    </CardHeader>

                    {saveMessage && (
                        <div className="mx-6 mt-4 p-3 bg-success-50 border border-success-200 rounded-lg text-sm text-success-700">
                            {saveMessage}
                        </div>
                    )}
                    {saveError && (
                        <div className="mx-6 mt-4"><ErrorMessage message={saveError} /></div>
                    )}

                    <CardBody className="p-0">
                        {rosterLoading ? (
                            <div className="p-8"><PageLoader /></div>
                        ) : roster.length === 0 ? (
                            <div className="p-12 text-center text-surface-400">
                                No students enrolled in this class.
                            </div>
                        ) : (
                            <div className="divide-y divide-surface-100">
                                {roster.map((s) => {
                                    const studentId = s.student_id;
                                    const scoreVal = scores[studentId] || "";
                                    const percentage =
                                        scoreVal && maxScore
                                            ? Math.round((parseFloat(scoreVal) / parseFloat(maxScore)) * 100)
                                            : null;

                                    return (
                                        <div
                                            key={studentId}
                                            className="flex items-center justify-between px-6 py-3 hover:bg-surface-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-xs shrink-0">
                                                    {s.students_profile?.users?.first_name?.[0]}
                                                    {s.students_profile?.users?.last_name?.[0]}
                                                </div>
                                                <p className="font-medium text-surface-900 text-sm">
                                                    {s.students_profile?.users?.first_name}{" "}
                                                    {s.students_profile?.users?.last_name}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={parseFloat(maxScore)}
                                                    placeholder="Score"
                                                    value={scoreVal}
                                                    onChange={(e) =>
                                                        setScores((prev) => ({
                                                            ...prev,
                                                            [studentId]: e.target.value,
                                                        }))
                                                    }
                                                    error={formErrors[`score_${studentId}`]}
                                                    className="w-24"
                                                />
                                                {percentage !== null && (
                                                    <span
                                                        className={`text-sm font-medium w-12 text-right ${percentage >= 75
                                                            ? "text-success-600"
                                                            : percentage >= 50
                                                                ? "text-warning-600"
                                                                : "text-danger-600"
                                                            }`}
                                                    >
                                                        {percentage}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
