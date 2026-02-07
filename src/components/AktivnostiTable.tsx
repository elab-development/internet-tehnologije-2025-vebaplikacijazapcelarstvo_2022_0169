"use client";

import { useEffect, useState } from "react";

type AktivnostRow = {
    id: string;
    naziv: string;
    opis: string | null;
    tip: "SEZONSKA" | "PCELAR" | "POLJOPRIVREDNIK";
    datum: string | null;
    uradjen: boolean;
};

export default function AktivnostiTable() {
    const [data, setData] = useState<AktivnostRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setLoading(true);
            const res = await fetch("/api/aktivnosti");
            if (!res.ok) throw new Error("Greška pri učitavanju");
            const json = await res.json();
            setData(json);
        } catch {
            setError("Ne mogu da učitam aktivnosti.");
        } finally {
            setLoading(false);
        }
    }

    async function toggle(aktivnostId: string, checked: boolean) {
        try {
            const res = await fetch("/api/aktivnosti/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aktivnostId, uradjen: checked }),
            });

            if (!res.ok) throw new Error();

            setData((prev) =>
                prev.map((a) =>
                    a.id === aktivnostId ? { ...a, uradjen: checked } : a
                )
            );
        } catch {
            setError("Ne mogu da sačuvam status.");
        }
    }

    useEffect(() => {
        load();
    }, []);

    if (loading) return <p>Učitavanje...</p>;

    return (
        <div className="overflow-x-auto">
            {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            <table className="w-full border-collapse overflow-hidden rounded-xl bg-white text-gray-900 shadow-md">
                <thead>
                    <tr className="bg-yellow-200">
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                            Naziv
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                            Tip
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                            Opis
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                            Datum
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">
                            Urađeno
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {data.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-4 py-6 text-center text-sm font-medium text-gray-600"
                            >
                                Nema aktivnosti.
                            </td>
                        </tr>
                    )}

                    {data.map((a) => (
                        <tr
                            key={a.id}
                            className="border-t border-yellow-100 hover:bg-yellow-50"
                        >
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                {a.naziv}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-800">
                                {a.tip}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-700">
                                {a.opis ?? "-"}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-700">
                                {a.datum ? a.datum.slice(0, 10) : "-"}
                            </td>

                            <td className="px-4 py-3 text-center">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 cursor-pointer accent-orange-500"
                                    checked={Boolean(a.uradjen)}
                                    onChange={(e) => toggle(a.id, e.target.checked)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
