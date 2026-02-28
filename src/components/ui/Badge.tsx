"use client";

import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "success" | "warning" | "danger" | "info" | "neutral";
    size?: "sm" | "md";
}

const variantStyles: Record<string, string> = {
    success: "bg-success-50 text-success-600 border-success-200",
    warning: "bg-warning-50 text-warning-600 border-warning-200",
    danger: "bg-danger-50 text-danger-600 border-danger-200",
    info: "bg-primary-50 text-primary-600 border-primary-200",
    neutral: "bg-surface-100 text-surface-600 border-surface-200",
};

export function Badge({ children, variant = "neutral", size = "sm" }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center font-medium border rounded-full
        ${variantStyles[variant]}
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
      `}
        >
            {children}
        </span>
    );
}

// Traffic light indicator dot for student roster
export function StatusDot({ status }: { status: "green" | "yellow" | "red" }) {
    const colors = {
        green: "bg-success-500",
        yellow: "bg-warning-500",
        red: "bg-danger-500",
    };

    return (
        <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status]}`}
            aria-label={`Status: ${status}`}
        />
    );
}
