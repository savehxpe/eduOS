"use client";

import React, { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
        const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-surface-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`
            block w-full rounded-lg border px-3 py-2.5 text-sm
            min-h-[44px]
            bg-white text-surface-900
            border-surface-300
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed
            ${error ? "border-danger-500 focus:ring-danger-500" : ""}
            ${className}
          `}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-danger-600">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";
