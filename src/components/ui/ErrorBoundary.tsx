"use client";

import React from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "./Button";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[400px] p-8">
                    <div className="text-center max-w-md">
                        <div className="mx-auto w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-danger-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-surface-900 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-sm text-surface-500 mb-6">
                            {this.state.error?.message || "An unexpected error occurred. Please try again."}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="secondary"
                                icon={<ArrowLeft className="h-4 w-4" />}
                                onClick={() => window.history.back()}
                            >
                                Go Back
                            </Button>
                            <Button
                                onClick={() => this.setState({ hasError: false, error: null })}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// API error display component (presentational)
export function ErrorMessage({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-4">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-danger-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-danger-800">{message}</p>
                    {onRetry && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRetry}
                            className="mt-2 text-danger-600 hover:text-danger-700"
                        >
                            Try Again
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
