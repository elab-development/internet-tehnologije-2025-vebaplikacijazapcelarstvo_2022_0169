"use client";

import { useEffect, useState } from "react";

export type NewPcelinjakForm = {
    naziv: string;
    geoSirina: string;
    geoDuzina: string;
    adresa: string;
};

const empty: NewPcelinjakForm = { naziv: "", geoSirina: "", geoDuzina: "", adresa: "" };

export default function NewPcelinjak({
    initial,
    onSubmit,
    onCancel,
    submitLabel = "Sačuvaj",
}: {
    initial?: NewPcelinjakForm;
    onSubmit: (data: NewPcelinjakForm) => void;
    onCancel?: () => void;
    submitLabel?: string;
}) {
    const [form, setForm] = useState<NewPcelinjakForm>(initial ?? empty);

    useEffect(() => {
        setForm(initial ?? empty);
    }, [initial]);

    function update<K extends keyof NewPcelinjakForm>(k: K, v: NewPcelinjakForm[K]) {
        setForm((p) => ({ ...p, [k]: v }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(form);
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-yellow-900">
                🐝 Podaci pčelinjaka
            </h3>

            <div className="mb-3">
                <label className="mb-1 block text-sm font-bold text-gray-700">Naziv</label>
                <input
                    value={form.naziv}
                    onChange={(e) => update("naziv", e.target.value)}
                    className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Unesite naziv pčelinjaka"
                />
            </div>

            <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">Geo širina</label>
                    <input
                        value={form.geoSirina}
                        onChange={(e) => update("geoSirina", e.target.value)}
                        className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="npr. 43.32"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">Geo dužina</label>
                    <input
                        value={form.geoDuzina}
                        onChange={(e) => update("geoDuzina", e.target.value)}
                        className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="npr. 21.89"
                    />
                </div>
            </div>

            <div className="mb-5">
                <label className="mb-1 block text-sm font-bold text-gray-700">Adresa</label>
                <input
                    value={form.adresa}
                    onChange={(e) => update("adresa", e.target.value)}
                    className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Unesite adresu"
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
