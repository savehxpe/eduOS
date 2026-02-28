"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-surface-50">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div
                className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}
        `}
            >
                <Topbar onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6 page-enter">
                    <ErrorBoundary>{children}</ErrorBoundary>
                </main>
            </div>
        </div>
    );
}
