"use client";

import React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { LogOut, Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface TopbarProps {
    onMenuToggle: () => void;
}

const roleLabels: Record<string, string> = {
    admin: "Administrator",
    teacher: "Teacher",
    student: "Student",
    parent: "Parent / Guardian",
};

const roleColors: Record<string, "success" | "info" | "warning" | "danger"> = {
    admin: "danger",
    teacher: "info",
    student: "success",
    parent: "warning",
};

export function Topbar({ onMenuToggle }: TopbarProps) {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
            {/* Left */}
            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg hover:bg-surface-100 text-surface-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    aria-label="Toggle menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="overflow-hidden">
                    <h1 className="text-sm font-semibold text-surface-900 truncate">
                        Welcome back, {user?.first_name || "User"}
                    </h1>
                    <p className="hidden sm:block text-[10px] md:text-xs text-surface-500">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1.5 md:gap-3">
                {user && (
                    <div className="hidden xs:block">
                        <Badge variant={roleColors[user.role]} size="sm">
                            <span className="hidden sm:inline">{roleLabels[user.role]}</span>
                            <span className="sm:hidden">{user.role.charAt(0).toUpperCase()}</span>
                        </Badge>
                    </div>
                )}

                <button
                    className="relative p-2 rounded-lg hover:bg-surface-100 text-surface-500 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-danger-500 rounded-full border border-white" />
                </button>

                <div className="hidden sm:block h-8 w-px bg-surface-200 mx-1" />

                <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs md:text-sm font-semibold ring-2 ring-white shadow-sm">
                        {user?.first_name?.[0] || "U"}
                        {user?.last_name?.[0] || ""}
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 rounded-lg hover:bg-danger-50 text-surface-500 hover:text-danger-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
                        aria-label="Sign out"
                        title="Sign out"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}

