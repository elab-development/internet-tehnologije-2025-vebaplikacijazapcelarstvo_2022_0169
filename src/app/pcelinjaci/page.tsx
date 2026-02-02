"use client";

import { useEffect, useState } from "react";
import ListaPcelinjaka, { PcelinjakItem } from "@/components/ListaPcelinjaka";
import NewPcelinjak, { NewPcelinjakForm } from "@/components/NewPcelinjak";
import PcelinjakSearch from "@/components/PcelinjakSearch";

type ModalState =
    | { open: false }
    | { open: true; mode: "add" }
    | { open: true; mode: "edit"; editId: string };

export default function Page() {
    const [pcelinjaci, setPcelinjaci] = useState<PcelinjakItem[]>([]);
    const [modal, setModal] = useState<ModalState>({ open: false });
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    const openAdd = () => setModal({ open: true, mode: "add" });
    const openEdit = (id: string) => setModal({ open: true, mode: "edit", editId: id });
    const close = () => setModal({ open: false });

    const editItem =
        modal.open && modal.mode === "edit"
            ? pcelinjaci.find((p) => p.id === modal.editId)
            : undefined;

    async function loadPcelinjaci() {
        setLoading(true);
        try {
            const res = await fetch("/api/pcelinjaci", { method: "GET" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Greška pri učitavanju pčelinjaka");

            setPcelinjaci(
                (data ?? []).map((p: any) => ({
                    ...p,
                    geoSirina: p.geoSirina == null ? null : Number(p.geoSirina),
                    geoDuzina: p.geoDuzina == null ? null : Number(p.geoDuzina),
                }))
            );
        } catch (e) {
            console.error(e);
            alert(String(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPcelinjaci();
    }, []);

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/pcelinjaci/${id}`, { method: "DELETE" });
            const out = await res.json();
            if (!res.ok) throw new Error(out?.error || "Neuspešno brisanje");

            alert("Pčelinjak je obrisan (zajedno sa košnicama).");
            await loadPcelinjaci();
        } catch (e) {
            console.error(e);
            alert(String(e));
        }
    }


    async function handleSubmit(data: NewPcelinjakForm) {
        if (!modal.open) return;

        try {
            if (modal.mode === "add") {
                const res = await fetch("/api/pcelinjaci", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        naziv: data.naziv.trim(),
                        geoSirina: data.geoSirina === "" ? null : Number(data.geoSirina),
                        geoDuzina: data.geoDuzina === "" ? null : Number(data.geoDuzina),
                        adresa: data.adresa.trim(),
                    }),
                });

                const out = await res.json();
                if (!res.ok) throw new Error(out?.error || "Neuspešno dodavanje");

                close();
                await loadPcelinjaci();
                return;
            }

            const res = await fetch(`/api/pcelinjaci/${modal.editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    naziv: data.naziv.trim(),
                    geoSirina: data.geoSirina === "" ? null : Number(data.geoSirina),
                    geoDuzina: data.geoDuzina === "" ? null : Number(data.geoDuzina),
                    adresa: data.adresa.trim(),
                }),
            });

            const out = await res.json();
            if (!res.ok) throw new Error(out?.error || "Neuspešna izmena");

            close();
            await loadPcelinjaci();
        } catch (e) {
            console.error(e);
            alert(String(e));
        }
    }

    const filtered = pcelinjaci.filter((p) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
            (p.naziv ?? "").toLowerCase().includes(q) ||
            (p.adresa ?? "").toLowerCase().includes(q)
        );
    });


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
                <div className="mb-6 rounded-3xl border border-yellow-200/70 bg-white/70 p-6 shadow-sm backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-yellow-900">
                                Moji pčelinjaci
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Dodaj, izmeni i otvori detalje pčelinjaka.
                            </p>
                        </div>

                        <button
                            onClick={openAdd}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-sm font-bold text-orange-900 shadow-md hover:opacity-95 active:scale-[0.99]"
                        >
                            <span className="text-lg leading-none">＋</span>
                            Dodaj
                        </button>
                    </div>
                </div>

                <PcelinjakSearch value={query} onChange={setQuery} />

                {loading ? (
                    <div className="rounded-2xl bg-white/70 p-6 text-gray-700">Učitavanje...</div>
                ) :
                    //     <ListaPcelinjaka pcelinjaci={filtered} onEdit={openEdit} onDelete={handleDelete} />

                    // )}
                    filtered.length === 0 ? (
                        <div className="rounded-3xl border border-yellow-200 bg-white/80 p-8 text-center shadow-sm">
                            <div className="mb-3 text-4xl">🐝</div>
                            <h3 className="text-lg font-extrabold text-yellow-900">
                                Još uvek nemaš nijedan pčelinjak
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Klikni na dugme <span className="font-semibold">„Dodaj“</span> i
                                napravi svoj prvi pčelinjak.
                            </p>

                            <button
                                onClick={openAdd}
                                className="
        mt-5 inline-flex items-center gap-2
        rounded-full
        bg-gradient-to-r from-yellow-400 to-orange-500
        px-6 py-3
        text-sm font-extrabold text-orange-900
        border-2 border-orange-400
        shadow-md
        hover:scale-105 transition
      "
                            >
                                <span className="text-lg">＋</span>
                                Dodaj prvi pčelinjak
                            </button>
                        </div>
                    ) : (
                        <ListaPcelinjaka
                            pcelinjaci={filtered}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                        />
                    )}

            </div>
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={close} />
                    <div className="relative z-10 w-full max-w-xl rounded-3xl border border-yellow-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-gray-900">
                                {modal.mode === "add" ? "Novi pčelinjak" : "Izmena pčelinjaka"}
                            </h2>
                            <button
                                onClick={close}
                                className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>

                        <NewPcelinjak
                            initial={
                                modal.mode === "edit" && editItem
                                    ? {
                                        naziv: editItem.naziv,
                                        geoSirina: editItem.geoSirina == null ? "" : String(editItem.geoSirina),
                                        geoDuzina: editItem.geoDuzina == null ? "" : String(editItem.geoDuzina),
                                        adresa: editItem.adresa ?? "",
                                    }
                                    : undefined
                            }
                            onSubmit={handleSubmit}
                            onCancel={close}
                            submitLabel={modal.mode === "add" ? "Sačuvaj pčelinjak" : "Sačuvaj izmene"}
                        />
                    </div>
                </div>
            )}

        </main >
    );
}
