"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import KosnicaSearch from "@/components/KosnicaSearch";
import ListaKosnica from "@/components/ListaKosnica";
import NewKosnica from "@/components/NewKosnica";

import type { Kosnica, KosnicaCreateDTO, KosnicaUpdateDTO, UUID } from "@/shared/types";

type ModalState =
    | { open: false }
    | { open: true; mode: "add" }
    | { open: true; mode: "edit"; editId: UUID };

function toKosnicaFromApiRow(row: any, pcelinjakId: string): Kosnica {
    const datumValue = row.datum ?? null;
    const datumIso =
        datumValue == null
            ? "" // ✅ ako ti je Kosnica.datum string u types.ts
            : typeof datumValue === "string"
                ? datumValue
                : new Date(datumValue).toISOString();

    return {
        id: String(row.id) as UUID,
        broj: Number(row.broj),
        tip: row.tip ?? null,
        datum: datumIso,
        starostMatice: row.starostMatice ?? row.starost_matice ?? null,
        brNastavaka: row.brNastavaka ?? row.br_nastavaka ?? null,
        pcelinjakId: String(row.pcelinjakId ?? row.pcelinjak_id ?? pcelinjakId) as UUID,
    };
}

export default function Page() {
    const params = useParams<{ id: string }>();
    const pcelinjakId = params.id;

    const [kosnice, setKosnice] = useState<Kosnica[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<ModalState>({ open: false });
    const [query, setQuery] = useState("");

    const openAdd = () => setModal({ open: true, mode: "add" });
    const openEdit = (id: UUID) => setModal({ open: true, mode: "edit", editId: id });
    const close = () => setModal({ open: false });

    // ✅ ovo je ono što puni formu kad klikneš olovku
    const editItem =
        modal.open && modal.mode === "edit"
            ? kosnice.find((k) => k.id === modal.editId)
            : undefined;

    async function loadKosnice() {
        setLoading(true);
        try {
            const res = await fetch(`/api/pcelinjaci/${pcelinjakId}/kosnice`, {
                method: "GET",
                cache: "no-store",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Greška pri učitavanju košnica");
            setKosnice((data ?? []).map((r: any) => toKosnicaFromApiRow(r, pcelinjakId)));
        } catch (e) {
            console.error(e);
            alert(String(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!pcelinjakId) return;
        loadKosnice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pcelinjakId]);

    const filtered = useMemo(() => {
        const s = query.trim().toLowerCase();
        if (!s) return kosnice;
        return kosnice.filter((k) => {
            const a = String(k.broj ?? "").toLowerCase();
            const b = String(k.tip ?? "").toLowerCase();
            return a.includes(s) || b.includes(s);
        });
    }, [kosnice, query]);

    async function handleDelete(kosnicaId: UUID) {
        try {
            const res = await fetch(`/api/kosnice/${kosnicaId}`, { method: "DELETE" });
            const out = await res.json();
            if (!res.ok) throw new Error(out?.error || "Neuspešno brisanje košnice");
            await loadKosnice();
        } catch (e) {
            console.error(e);
            alert(String(e));
        }
    }


    async function handleSubmit(form: KosnicaUpdateDTO) {
        if (!modal.open) return;

        try {
            if (modal.mode === "add") {
                const broj = form.broj;
                if (broj == null) {
                    alert("Broj je obavezan.");
                    return;
                }

                const createPayload: KosnicaCreateDTO = {
                    broj,
                    pcelinjakId: pcelinjakId as UUID,
                    tip: form.tip ?? null,
                    starostMatice: form.starostMatice ?? null,
                    brNastavaka: form.brNastavaka ?? null,
                    ...(form.datum ? { datum: form.datum } : {}),
                };

                const res = await fetch(`/api/pcelinjaci/${pcelinjakId}/kosnice`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(createPayload),
                });

                const out = await res.json();
                if (!res.ok) throw new Error(out?.error || "Neuspešno dodavanje košnice");

                close();
                await loadKosnice();
                return;
            }


            const updatePayload: KosnicaUpdateDTO = { ...form };

            const res = await fetch(`/api/kosnice/${modal.editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
            });

            const out = await res.json();
            if (!res.ok) throw new Error(out?.error || "Neuspešna izmena košnice");

            close();
            await loadKosnice();
        } catch (e) {
            console.error(e);
            alert(String(e));
        }
    }


return (
    <main
        className="min-h-screen px-4 py-8"
        style={{
            backgroundImage: "url(/pozadina.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
        }}
    >
        <div className="mx-auto max-w-4xl">
            {/* HEADER u page.tsx */}
            <div className="mb-6 rounded-3xl border border-yellow-200/70 bg-white/70 p-6 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-yellow-900">
                            Košnice pčelinjaka
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Pregled, pretraga, dodavanje i izmena košnica.
                        </p>
                    </div>

                    <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-[0.99]"
                    >
                        <span className="text-lg leading-none">＋</span>
                        Dodaj
                    </button>
                </div>
            </div>

            {/* Search kao poseban blok */}
            <KosnicaSearch value={query} onChange={setQuery} />

            {loading ? (
                <div className="rounded-2xl bg-white/70 p-6 text-gray-700">Učitavanje...</div>
            ) : filtered.length === 0 ? (
                <div className="rounded-3xl border border-yellow-200 bg-white/80 p-8 text-center shadow-sm">
                    <div className="mb-3 text-4xl">🐝</div>
                    <h3 className="text-lg font-extrabold text-yellow-900">
                        Još uvek nemaš nijednu košnicu
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Klikni na dugme <span className="font-semibold">„Dodaj“</span> i napravi prvu košnicu.
                    </p>

                    <button
                        onClick={openAdd}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-sm font-extrabold text-white shadow-md hover:opacity-95"
                    >
                        <span className="text-lg">＋</span>
                        Dodaj prvu košnicu
                    </button>
                </div>
            ) : (
                <ListaKosnica kosnice={filtered} onEdit={openEdit} onDelete={handleDelete} />
            )}

            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={close} />
                    <div className="relative z-10 w-full max-w-xl rounded-3xl border border-yellow-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-gray-900">
                                {modal.mode === "add" ? "Nova košnica" : "Izmena košnice"}
                            </h2>
                            <button
                                onClick={close}
                                className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>

                        <NewKosnica
                            initial={
                                modal.mode === "edit" && editItem
                                    ? {
                                        broj: String(editItem.broj ?? ""),
                                        tip: editItem.tip ?? "",
                                        starostMatice:
                                            editItem.starostMatice == null ? "" : String(editItem.starostMatice),
                                        brNastavaka:
                                            editItem.brNastavaka == null ? "" : String(editItem.brNastavaka),
                                    }
                                    : undefined
                            }
                            onSubmit={handleSubmit}
                            onCancel={close}
                            submitLabel={modal.mode === "add" ? "Sačuvaj košnicu" : "Sačuvaj izmene"}
                        />
                    </div>
                </div>
            )}
        </div>
    </main>
);
}
