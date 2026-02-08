"use client";

import { useEffect, useState } from "react";

export type ProfileFormValues = {
    ime: string;
    prezime: string;
    email: string;
};

export default function ProfileForm({
    initial,
    onSubmit,
    loading,
}: {
    initial: ProfileFormValues;
    onSubmit: (v: ProfileFormValues) => void;
    loading?: boolean;
}) {
    const [form, setForm] = useState<ProfileFormValues>(initial);

    useEffect(() => setForm(initial), [initial]);

    function update<K extends keyof ProfileFormValues>(k: K, v: ProfileFormValues[K]) {
        setForm((p) => ({ ...p, [k]: v }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit({
            ime: form.ime.trim(),
            prezime: form.prezime.trim(),
            email: form.email.trim(),
        });
    }

    return (
        <form onSubmit={submit} className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">Ime</label>
                    <input
                        value={form.ime}
                        onChange={(e) => update("ime", e.target.value)}
                        className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">Prezime</label>
                    <input
                        value={form.prezime}
                        onChange={(e) => update("prezime", e.target.value)}
                        className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-gray-700">Email</label>
                    <input
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
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
                    {loading ? "Čuvam..." : "Sačuvaj izmene"}
                </button>
            </div>
        </form>
    );
}
