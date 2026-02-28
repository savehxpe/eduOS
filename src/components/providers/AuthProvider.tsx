"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserRole } from "@/lib/types";

interface AuthUser {
    id: string;
    role: UserRole;
    email: string;
    first_name: string;
    last_name: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => ({ success: false }),
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("eduos-user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("eduos-user");
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!data.success) {
                return { success: false, error: data.error };
            }

            const userData: AuthUser = data.data.user;
            setUser(userData);
            localStorage.setItem("eduos-user", JSON.stringify(userData));
            return { success: true };
        } catch {
            return { success: false, error: "Network error. Please check your connection." };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Continue with local cleanup even if API fails
        }
        setUser(null);
        localStorage.removeItem("eduos-user");
        window.location.href = "/login";
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
