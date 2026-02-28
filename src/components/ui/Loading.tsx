"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeMap = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };

    return (
        <div className="flex items-center justify-center p-8">
            <svg
                className={`animate-spin ${sizeMap[size]} text-primary-600`}
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
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-surface-500 animate-pulse">Loading data...</p>
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-8 w-16 mb-2" />
            <div className="skeleton h-3 w-32" />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="p-4 border-b border-surface-100">
                <div className="skeleton h-4 w-32" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 p-4 border-b border-surface-50"
                >
                    <div className="skeleton h-4 w-8" />
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-4 w-24 ml-auto" />
                </div>
            ))}
        </div>
    );
}
