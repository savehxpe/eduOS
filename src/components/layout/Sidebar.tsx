"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    ClipboardList,
    BarChart3,
    GraduationCap,
    UserCheck,
    Settings,
    ChevronLeft,
} from "lucide-react";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const roleNavItems: Record<string, NavItem[]> = {
    admin: [
        { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: "Users", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
        { label: "Subjects", href: "/admin/subjects", icon: <BookOpen className="h-5 w-5" /> },
        { label: "Classes", href: "/admin/classes", icon: <GraduationCap className="h-5 w-5" /> },
        { label: "Reports", href: "/admin/reports", icon: <BarChart3 className="h-5 w-5" /> },
    ],
    teacher: [
        { label: "Dashboard", href: "/teacher", icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: "My Classes", href: "/teacher/classes", icon: <GraduationCap className="h-5 w-5" /> },
        { label: "Attendance", href: "/teacher/attendance", icon: <UserCheck className="h-5 w-5" /> },
        { label: "Gradebook", href: "/teacher/gradebook", icon: <ClipboardList className="h-5 w-5" /> },
    ],
    student: [
        { label: "Dashboard", href: "/student", icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: "My Grades", href: "/student/grades", icon: <ClipboardList className="h-5 w-5" /> },
        { label: "Attendance", href: "/student/attendance", icon: <Calendar className="h-5 w-5" /> },
    ],
    parent: [
        { label: "Dashboard", href: "/parent", icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: "Grades", href: "/parent/grades", icon: <ClipboardList className="h-5 w-5" /> },
        { label: "Attendance", href: "/parent/attendance", icon: <Calendar className="h-5 w-5" /> },
    ],
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();

    const navItems = user ? roleNavItems[user.role] || [] : [];

    return (
        <aside
            className={`
        fixed left-0 top-0 h-screen bg-surface-900 text-white
        flex flex-col z-40
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[260px]"}
`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-700/50">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                    eO
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold tracking-tight">
                        edu<span className="text-primary-400">OS</span>
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== `/ ${user?.role} ` && pathname.startsWith(item.href));

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                    flex items - center gap - 3 px - 3 py - 2.5 rounded - lg
min - h - [44px]
text - sm font - medium
transition - colors duration - 150
                    ${isActive
                                            ? "bg-primary-600/20 text-primary-400"
                                            : "text-surface-300 hover:bg-surface-800 hover:text-white"
                                        }
`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Collapse toggle */}
            <div className="p-3 border-t border-surface-700/50">
                <button
                    onClick={onToggle}
                    className="flex items-center justify-center w-full p-2.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors min-h-[44px] cursor-pointer"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronLeft
                        className={`h - 5 w - 5 transition - transform ${collapsed ? "rotate-180" : ""} `}
                    />
                    {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
