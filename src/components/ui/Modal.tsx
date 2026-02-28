"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

const sizeMap: Record<string, string> = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
};

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]" />

            {/* Modal */}
            <div
                className={`
          relative bg-white rounded-2xl shadow-2xl w-full ${sizeMap[size]}
          animate-[fadeIn_200ms_ease-out]
          max-h-[90vh] flex flex-col
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
                    <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
}
