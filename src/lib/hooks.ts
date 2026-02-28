"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(url, options);
            const json = await res.json();
            if (!json.success) {
                setError(json.error || "Failed to fetch data.");
            } else {
                setData(json.data);
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

/**
 * POST helper with error handling
 */
export async function apiPost<T>(
    url: string,
    body: unknown
): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return await res.json();
    } catch {
        return { success: false, error: "Network error. Please try again." };
    }
}
