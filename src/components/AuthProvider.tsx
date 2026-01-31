"use client"

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export type User = { id: string; name: string; email: string; createdAt: string }


type AuthState = { status: "loading"; user: null }
    | { status: "unauthenticated"; user: null }
    | { status: "authenticated"; user: User };


type Ctx = AuthState & {
    refresh: () => Promise<void>
    logout: () => Promise<void>
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [state, setState] = useState<AuthState>({ status: "loading", user: null })

    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me", { credentials: "include" })
            const data = await res.json()
            if (!data || !data?.user) {
                setState({ status: "unauthenticated", user: null })
            } else {
                setState({ status: "authenticated", user: data.user })
            }
        } catch {
            setState({ status: "unauthenticated", user: null })
        }
    }, [])

    const logout = async () => {
        const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
        setState({ status: "unauthenticated", user: null })
        router.refresh()
    }

    useEffect(() => {
        refresh()
    }, [refresh])


    const value = useMemo<Ctx>(() => ({ ...state, refresh, logout }), [state, refresh, logout])
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx;
}
