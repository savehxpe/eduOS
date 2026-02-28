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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Sidebar with mobile drawer support */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            {/* Main Content Area */}
            <div
                className={`
          transition-all duration-300 ease-in-out flex flex-col min-h-screen
          ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}
        `}
            >
                <Topbar onMenuToggle={() => setMobileMenuOpen(true)} />
                <main className="flex-1 p-4 md:p-6 page-enter pb-20 md:pb-6">
                    <ErrorBoundary>{children}</ErrorBoundary>
                </main>
            </div>
        </div>
    );
}

