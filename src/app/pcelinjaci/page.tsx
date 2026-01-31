"use client";

import { useEffect, useState } from "react";
// Koristimo direktnu putanju ako @ pravi problem
import ListaPcelinjaka, { PcelinjakItem } from "../../components/ListaPcelinjaka";

export default function Page() {
    const [pcelinjaci, setPcelinjaci] = useState<PcelinjakItem[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadPcelinjaci() {
        setLoading(true);
        try {
            const res = await fetch("/api/pcelinjaci", {
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data?.error || "Greška");

            setPcelinjaci(
                (data ?? []).map((p: any) => ({
                    ...p,
                    geoSirina: p.geoSirina == null ? null : Number(p.geoSirina),
                    geoDuzina: p.geoDuzina == null ? null : Number(p.geoDuzina),
                }))
            );
        } catch (e) {
            console.error("Neuspešno učitavanje:", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPcelinjaci();
    }, []);

    return (
        <main className="min-h-screen p-8 bg-amber-50">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-yellow-900 mb-6">Moji pčelinjaci</h1>

                {loading ? (
                    <div className="p-4 bg-white rounded-xl shadow">Učitavanje podataka...</div>
                ) : (
                    <ListaPcelinjaka pcelinjaci={pcelinjaci} />
                )}
            </div>
        </main>
    );
}