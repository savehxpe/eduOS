"use client";

import React from "react";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: { value: number; positive: boolean };
    color?: "blue" | "green" | "amber" | "red" | "purple";
}

const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    blue: {
        bg: "bg-primary-50",
        icon: "text-primary-600",
        text: "text-primary-700",
    },
    green: {
        bg: "bg-success-50",
        icon: "text-success-600",
        text: "text-success-600",
    },
    amber: {
        bg: "bg-warning-50",
        icon: "text-warning-600",
        text: "text-warning-600",
    },
    red: {
        bg: "bg-danger-50",
        icon: "text-danger-600",
        text: "text-danger-600",
    },
    purple: {
        bg: "bg-purple-50",
        icon: "text-purple-600",
        text: "text-purple-700",
    },
};

export function MetricCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = "blue",
}: MetricCardProps) {
    const colors = colorMap[color];

    return (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5 card-hover">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-surface-500 mb-1">{title}</p>
                    <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
                    {subtitle && (
                        <p className="text-xs text-surface-400 mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div
                            className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.positive ? "text-success-600" : "text-danger-600"
                                }`}
                        >
                            <svg
                                className={`h-3 w-3 ${!trend.positive ? "rotate-180" : ""}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {trend.value}%
                        </div>
                    )}
                </div>
                <div
                    className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
