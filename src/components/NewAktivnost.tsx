"use client";

import { useEffect, useState } from "react";

export type NewAktivnostForm = {
    naziv: string;
    opis: string;
    datum: string; // "YYYY-MM-DD"
};

const empty: NewAktivnostForm = { naziv: "", opis: "", datum: "" };

export default function NewAktivnost({
    initial,
    onSubmit,
    onCancel,
    submitLabel = "Sačuvaj",
}: {
    initial?: NewAktivnostForm;
    onSubmit: (data: NewAktivnostForm) => void;
    onCancel?: () => void;
    submitLabel?: string;
}) {
    const [form, setForm] = useState<NewAktivnostForm>(initial ?? empty);

    useEffect(() => {
        setForm(initial ?? empty);
    }, [initial]);

    function update<K extends keyof NewAktivnostForm>(k: K, v: NewAktivnostForm[K]) {
        setForm((p) => ({ ...p, [k]: v }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(form);
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-yellow-900">
                🐝 Aktivnost
            </h3>

            <div className="mb-3">
                <label className="mb-1 block text-sm font-bold text-gray-700">Naziv</label>
                <input
                    value={form.naziv}
                    onChange={(e) => update("naziv", e.target.value)}
                    className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Unesite naziv aktivnosti"
                />
            </div>

            <div className="mb-3">
                <label className="mb-1 block text-sm font-bold text-gray-700">Opis</label>
                <input
                    value={form.opis}
                    onChange={(e) => update("opis", e.target.value)}
                    className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Unesite opis (opciono)"
                />
            </div>

            <div className="mb-5">
                <label className="mb-1 block text-sm font-bold text-gray-700">Datum</label>
                <input
                    type="date"
                    value={form.datum}
                    onChange={(e) => update("datum", e.target.value)}
                    className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-95"
                >
                    {submitLabel}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                    >
                        Otkaži
                    </button>
                )}
            </div>
        </form>
    );
}
