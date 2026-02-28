"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { useFetch, apiPost } from "@/lib/hooks";
import { Plus, Search, UserPlus, Mail } from "lucide-react";

interface UserItem {
    id: string;
    role: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
}

const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "teacher", label: "Teacher" },
    { value: "student", label: "Student" },
    { value: "parent", label: "Parent" },
];

const roleBadgeVariant: Record<string, "danger" | "info" | "success" | "warning"> = {
    admin: "danger",
    teacher: "info",
    student: "success",
    parent: "warning",
};

export default function UsersPage() {
    const { data: users, loading, error, refetch } = useFetch<UserItem[]>("/api/users");
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "student",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.first_name.trim()) errors.first_name = "First name is required.";
        if (!formData.last_name.trim()) errors.last_name = "Last name is required.";
        if (!formData.email.trim()) errors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errors.email = "Invalid email format.";
        if (!formData.password) errors.password = "Password is required.";
        else if (formData.password.length < 6)
            errors.password = "Password must be at least 6 characters.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        setSubmitError("");

        const result = await apiPost("/api/users", formData);

        if (result.success) {
            setShowModal(false);
            setFormData({ first_name: "", last_name: "", email: "", password: "", role: "student" });
            setFormErrors({});
            refetch();
        } else {
            setSubmitError(result.error || "Failed to create user.");
        }
        setSubmitting(false);
    };

    const filteredUsers = users?.filter((u) => {
        const matchesSearch =
            !searchQuery ||
            `${u.first_name} ${u.last_name} ${u.email}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesRole = !filterRole || u.role === filterRole;
        return matchesSearch && matchesRole;
    }) || [];

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">User Management</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Manage all system users and their roles
                    </p>
                </div>
                <Button
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setShowModal(true)}
                >
                    Add User
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="h-4 w-4" />}
                    />
                </div>
                <Select
                    options={[{ value: "", label: "All Roles" }, ...roleOptions]}
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-48"
                />
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <p className="text-sm font-medium text-surface-500">
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                    </p>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-50 border-b border-surface-200">
                                <th className="px-6 py-3 text-left font-medium text-surface-500">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-surface-500">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-xs shrink-0">
                                                {user.first_name[0]}{user.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-surface-900">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-surface-600">
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-surface-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={roleBadgeVariant[user.role]}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-surface-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-surface-400">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create User Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setFormErrors({});
                    setSubmitError("");
                }}
                title="Create New User"
                size="md"
            >
                {submitError && (
                    <div className="mb-4">
                        <ErrorMessage message={submitError} />
                    </div>
                )}
                <form onSubmit={handleCreate} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            value={formData.first_name}
                            onChange={(e) =>
                                setFormData({ ...formData, first_name: e.target.value })
                            }
                            error={formErrors.first_name}
                            disabled={submitting}
                        />
                        <Input
                            label="Last Name"
                            value={formData.last_name}
                            onChange={(e) =>
                                setFormData({ ...formData, last_name: e.target.value })
                            }
                            error={formErrors.last_name}
                            disabled={submitting}
                        />
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        error={formErrors.email}
                        icon={<Mail className="h-4 w-4" />}
                        disabled={submitting}
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        error={formErrors.password}
                        helperText="Minimum 6 characters"
                        disabled={submitting}
                    />
                    <Select
                        label="Role"
                        options={roleOptions}
                        value={formData.role}
                        onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                        }
                    />
                    <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                        <Button
                            variant="secondary"
                            onClick={() => setShowModal(false)}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={submitting}
                            icon={<UserPlus className="h-4 w-4" />}
                        >
                            Create User
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
