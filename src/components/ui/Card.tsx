"use client";

import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = "", hoverable = false, onClick }: CardProps) {
    return (
        <div
            className={`
        bg-white rounded-xl border border-surface-200 
        shadow-sm overflow-hidden
        ${hoverable ? "card-hover cursor-pointer" : ""}
        ${className}
      `}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`px-6 py-4 border-b border-surface-100 ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`px-6 py-3 border-t border-surface-100 bg-surface-50 ${className}`}>
            {children}
        </div>
    );
}
