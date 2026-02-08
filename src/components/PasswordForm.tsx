"use client";

import { useState } from "react";

export type PasswordFormValues = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export default function PasswordForm({
    onSubmit,
    loading,
}: {
    onSubmit: (v: PasswordFormValues) => void;
    loading?: boolean;
}) {
    const [form, setForm] = useState<PasswordFormValues>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    function update<K extends keyof PasswordFormValues>(k: K, v: PasswordFormValues[K]) {
        setForm((p) => ({ ...p, [k]: v }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(form);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }

    return (
        <form onSubmit={submit} className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-gray-700">Trenutna šifra</label>
                    <input
                        type="password"
                        value={form.currentPassword}
                        onChange={(e) => update("currentPassword", e.target.value)}
                        className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">Nova šifra</label>
                    <input
                        type="password"
                        value={form.newPassword}
                        onChange={(e) => update("newPassword", e.target.value)}
                        className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">Potvrdi novu šifru</label>
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => update("confirmPassword", e.target.value)}
                        className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                </div>
            </div>

            <div className="mt-5">
                <button
                    type="submit"
                    disabled={Boolean(loading)}
                    className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                >
                    {loading ? "Menjam..." : "Promeni šifru"}
                </button>
            </div>
        </form>
    );
}
