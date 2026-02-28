"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorBoundary";
import { Mail, Lock, GraduationCap } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!email) errors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errors.email = "Please enter a valid email address.";
        if (!password) errors.password = "Password is required.";
        else if (password.length < 6)
            errors.password = "Password must be at least 6 characters.";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validate()) return;

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            // Read user from localStorage to get role
            const stored = localStorage.getItem("eduos-user");
            if (stored) {
                const user = JSON.parse(stored);
                router.push(`/${user.role}`);
            }
        } else {
            setError(result.error || "Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 mb-4">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        edu<span className="text-primary-400">OS</span>
                    </h1>
                    <p className="text-surface-400 text-sm mt-1">
                        School Management Platform
                    </p>
                </div>

                {/* Login card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-semibold text-surface-900 mb-1">
                        Sign in to your account
                    </h2>
                    <p className="text-sm text-surface-500 mb-6">
                        Enter your credentials to access the platform
                    </p>

                    {error && (
                        <div className="mb-4">
                            <ErrorMessage message={error} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@school.edu"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) {
                                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                                }
                            }}
                            onBlur={validate}
                            error={fieldErrors.email}
                            icon={<Mail className="h-4 w-4" />}
                            autoComplete="email"
                            disabled={loading}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (fieldErrors.password) {
                                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                                }
                            }}
                            onBlur={validate}
                            error={fieldErrors.password}
                            icon={<Lock className="h-4 w-4" />}
                            autoComplete="current-password"
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full mt-2"
                            size="lg"
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-surface-100">
                        <p className="text-xs text-center text-surface-400">
                            Contact your administrator if you need access credentials.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
