"use client";

import React, { forwardRef, useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, icon, className = "", id, ...props }, ref) => {
        const [focused, setFocused] = useState(false);
        const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-surface-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              block w-full rounded-lg border px-3 py-2.5 text-sm
              min-h-[44px]
              bg-white text-surface-900
              placeholder:text-surface-400
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${icon ? "pl-10" : ""}
              ${error
                                ? "border-danger-500 focus:ring-danger-500 focus:border-danger-500"
                                : focused
                                    ? "border-primary-500 ring-2 ring-primary-500/20"
                                    : "border-surface-300 focus:ring-primary-500 focus:border-primary-500"
                            }
              disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed
              ${className}
            `}
                        onFocus={(e) => {
                            setFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setFocused(false);
                            props.onBlur?.(e);
                        }}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-danger-600 flex items-center gap-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-surface-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
