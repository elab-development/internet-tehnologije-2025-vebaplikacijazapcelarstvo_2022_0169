"use client";

import { useEffect, useMemo, useState } from "react";
import ListaAktivnosti, { AktivnostItem } from "@/components/ListaAktivnosti";
import NewAktivnost, { NewAktivnostForm } from "@/components/NewAktivnost";
import AktivnostSearch from "@/components/AktivnostSearch";

type ModalState =
    | { open: false }
    | { open: true; mode: "add" }
    | { open: true; mode: "edit"; editId: string };

export default function AktivnostiTable() {
    const [data, setData] = useState<AktivnostItem[]>([]);
    const [modal, setModal] = useState<ModalState>({ open: false });
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

    const openAdd = () => setModal({ open: true, mode: "add" });
    const openEdit = (id: string) => setModal({ open: true, mode: "edit", editId: id });
    const close = () => setModal({ open: false });

    const editItem = useMemo(() => {
        if (!modal.open || modal.mode !== "edit") return undefined;
        return data.find((x) => x.id === modal.editId);
    }, [modal, data]);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/aktivnosti", { method: "GET" });

            const text = await res.text();
            const out = text ? JSON.parse(text) : [];

            if (!res.ok) throw new Error(out?.message || out?.error || "Ne mogu da učitam aktivnosti.");

            setData(
                (out ?? []).map((a: any) => ({
                    id: a.id,
                    naziv: a.naziv,
                    opis: a.opis ?? null,
                    tip: a.tip,
                    datum: a.datum ?? null,
                    uradjen: a.uradjen === true,
                    canEdit: a.canEdit === true,
                    canDelete: a.canDelete === true,
                }))
            );
        } catch (e: any) {
            setError(String(e?.message || e));
            setData([]);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data;
        return data.filter((a) => {
            return (
                (a.naziv ?? "").toLowerCase().includes(q) ||
                (a.opis ?? "").toLowerCase().includes(q) ||
                (a.tip ?? "").toLowerCase().includes(q)
            );
        });
    }, [data, query]);

    async function handleSubmit(form: NewAktivnostForm) {
        if (!modal.open) return;

        const payload = {
            naziv: form.naziv.trim(),
            opis: form.opis.trim() === "" ? null : form.opis.trim(),
            datum: form.datum === "" ? null : form.datum, // YYYY-MM-DD
        };

        try {
            setError(null);

            if (modal.mode === "add") {
                const res = await fetch("/api/aktivnosti", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const out = await res.json();
                if (!res.ok) throw new Error(out?.message || out?.error || "Neuspešno dodavanje.");

                close();
                await load();
                return;
            }

            // edit
            const res = await fetch(`/api/aktivnosti/${modal.editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const out = await res.json();
            if (!res.ok) throw new Error(out?.message || out?.error || "Neuspešna izmena.");

            close();
            await load();
        } catch (e: any) {
            setError(String(e?.message || e));
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Da li si siguran da želiš da obrišeš ovu aktivnost?")) return;
        try {
            setError(null);
            const res = await fetch(`/api/aktivnosti/${id}`, { method: "DELETE" });
            const out = await res.json();
            if (!res.ok) throw new Error(out?.message || out?.error || "Neuspešno brisanje.");

            await load();
        } catch (e: any) {
            setError(String(e?.message || e));
        }
    }

    async function toggleDone(id: string, checked: boolean) {
        try {
            setError(null);
            // optimistički update
            setData((prev) => prev.map((x) => (x.id === id ? { ...x, uradjen: checked } : x)));

            const res = await fetch(`/api/aktivnosti/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uradjen: checked }),
            });
            const out = await res.json();
            if (!res.ok) throw new Error(out?.message || out?.error || "Ne mogu da sačuvam status.");

            // sync sa serverom (za svaki slučaj)
            setData((prev) =>
                prev.map((x) => (x.id === id ? { ...x, uradjen: Boolean(out?.uradjen) } : x))
            );
        } catch (e: any) {
            // rollback
            setData((prev) => prev.map((x) => (x.id === id ? { ...x, uradjen: !checked } : x)));
            setError(String(e?.message || e));
        }
    }

    return (
        <>
            <div className="mb-4 flex items-center justify-between gap-3">
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-sm font-bold text-orange-900 shadow-md hover:opacity-95 active:scale-[0.99]"
                >
                    <span className="text-lg leading-none">＋</span>
                    Dodaj aktivnost
                </button>

                <button
                    onClick={load}
                    className="rounded-full bg-white/90 px-5 py-3 text-sm font-extrabold text-gray-800 ring-1 ring-gray-200 hover:bg-white"
                >
                    Osveži
                </button>
            </div>

            <AktivnostSearch value={query} onChange={setQuery} />

            {error && (
                <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl bg-white/80 p-6 text-gray-800">Učitavanje...</div>
            ) : (
                <ListaAktivnosti
                    aktivnosti={filtered}
                    onRowClick={(a) => openEdit(a.id)}
                    onDelete={handleDelete}
                    onToggleDone={toggleDone}
                />

            )}

            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={close} />
                    <div className="relative z-10 w-full max-w-xl rounded-3xl border border-yellow-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-gray-900">
                                {modal.mode === "add" ? "Nova aktivnost" : "Izmena aktivnosti"}
                            </h2>
                            <button
                                onClick={close}
                                className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>

                        <NewAktivnost
                            initial={
                                modal.mode === "edit" && editItem
                                    ? {
                                        naziv: editItem.naziv ?? "",
                                        opis: editItem.opis ?? "",
                                        datum: editItem.datum ? editItem.datum.slice(0, 10) : "",
                                    }
                                    : undefined
                            }
                            onSubmit={handleSubmit}
                            onCancel={close}
                            submitLabel={modal.mode === "add" ? "Sačuvaj aktivnost" : "Sačuvaj izmene"}
                        />

                        {modal.mode === "edit" && editItem?.tip !== "PCELAR" && (
                            <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
                                Ova aktivnost nije tvoja (sezonska/poljoprivrednik) i ne može se menjati.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
