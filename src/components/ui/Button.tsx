"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
    primary:
        "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300 shadow-sm",
    secondary:
        "bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300 disabled:bg-surface-50 border border-surface-200",
    danger:
        "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 disabled:bg-danger-300 shadow-sm",
    ghost:
        "bg-transparent text-surface-600 hover:bg-surface-100 active:bg-surface-200 disabled:text-surface-300",
    outline:
        "bg-transparent text-primary-600 border-2 border-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:border-surface-200 disabled:text-surface-300",
};

const sizeStyles: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm min-h-[36px] min-w-[36px]",
    md: "px-4 py-2 text-sm min-h-[44px] min-w-[44px]",
    lg: "px-6 py-3 text-base min-h-[48px] min-w-[48px]",
};

export function Button({
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
        inline-flex items-center justify-center gap-2 
        font-medium rounded-lg
        focus-ring cursor-pointer
        transition-all duration-150
        disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            ) : icon ? (
                icon
            ) : null}
            {children}
        </button>
    );
}
