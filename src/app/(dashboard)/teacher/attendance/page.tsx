"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch, apiPost } from "@/lib/hooks";
import { Save, UserCheck, UserX, Clock } from "lucide-react";

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

type AttendanceStatus = "present" | "absent" | "late";

export default function TeacherAttendancePage() {
    const { data: classes, loading: classesLoading } = useFetch<ClassItem[]>("/api/classes");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [roster, setRoster] = useState<StudentRoster[]>([]);
    const [rosterLoading, setRosterLoading] = useState(false);
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveError, setSaveError] = useState("");

    // Fetch roster when class changes
    useEffect(() => {
        if (!selectedClass) return;
        setRosterLoading(true);
        fetch(`/api/classes/${selectedClass}/students`)
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    setRoster(json.data || []);
                    // Initialize attendance with "present" for all students
                    const initial: Record<string, AttendanceStatus> = {};
                    json.data?.forEach((s: StudentRoster) => {
                        initial[s.student_id] = "present";
                    });
                    setAttendance(initial);
                }
            })
            .catch(() => setRoster([]))
            .finally(() => setRosterLoading(false));
    }, [selectedClass]);

    const toggleStatus = (studentId: string) => {
        setAttendance((prev) => {
            const current = prev[studentId];
            const next: AttendanceStatus =
                current === "present" ? "late" : current === "late" ? "absent" : "present";
            return { ...prev, [studentId]: next };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage("");
        setSaveError("");

        const records = Object.entries(attendance).map(([student_id, status]) => ({
            student_id,
            status,
        }));

        const result = await apiPost<{ message?: string }>("/api/attendance", {
            class_id: selectedClass,
            date: selectedDate,
            records,
        });

        if (result.success) {
            setSaveMessage("Attendance saved successfully!");
        } else {
            setSaveError(result.error || "Failed to save attendance.");
        }
        setSaving(false);
    };

    const statusIcon: Record<AttendanceStatus, React.ReactNode> = {
        present: <UserCheck className="h-5 w-5 text-success-600" />,
        late: <Clock className="h-5 w-5 text-warning-600" />,
        absent: <UserX className="h-5 w-5 text-danger-600" />,
    };

    const statusBadge: Record<AttendanceStatus, "success" | "warning" | "danger"> = {
        present: "success",
        late: "warning",
        absent: "danger",
    };

    if (classesLoading) return <PageLoader />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Attendance</h1>
                <p className="text-sm text-surface-500 mt-1">
                    Record daily attendance for your classes
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
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
                    className="flex-1"
                />
                <Input
                    label="Date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-48"
                />
            </div>

            {/* Student Roster */}
            {selectedClass && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-surface-900">
                                Student Roster ({roster.length} students)
                            </p>
                            <Button
                                icon={<Save className="h-4 w-4" />}
                                onClick={handleSave}
                                loading={saving}
                                disabled={roster.length === 0}
                            >
                                Save Attendance
                            </Button>
                        </div>
                    </CardHeader>

                    {saveMessage && (
                        <div className="mx-6 mt-4 p-3 bg-success-50 border border-success-200 rounded-lg text-sm text-success-700">
                            {saveMessage}
                        </div>
                    )}
                    {saveError && (
                        <div className="mx-6 mt-4">
                            <ErrorMessage message={saveError} />
                        </div>
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
                                {roster.map((s) => (
                                    <div
                                        key={s.student_id}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-surface-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-xs">
                                                {s.students_profile?.users?.first_name?.[0]}
                                                {s.students_profile?.users?.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-surface-900 text-sm">
                                                    {s.students_profile?.users?.first_name}{" "}
                                                    {s.students_profile?.users?.last_name}
                                                </p>
                                                <p className="text-xs text-surface-400">
                                                    {s.students_profile?.users?.email}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleStatus(s.student_id)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-100 transition-colors min-h-[44px] cursor-pointer"
                                        >
                                            {statusIcon[attendance[s.student_id] || "present"]}
                                            <Badge variant={statusBadge[attendance[s.student_id] || "present"]}>
                                                {attendance[s.student_id] || "present"}
                                            </Badge>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
