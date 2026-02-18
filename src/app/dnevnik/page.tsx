"use client";

import { useEffect, useMemo, useState } from "react";
import DnevnikSearch, { type DnevnikSort } from "@/components/DnevnikSearch";
import WeatherWidget from "@/components/WeatherWidget";
import ListaDnevnika, { type DnevnikItem } from "@/components/ListaDnevnika";
import NewDnevnik, { type NewDnevnikForm } from "@/components/NewDnevnik";

type PcelinjakOpt = { id: string; naziv: string; adresa: string | null };


type KosnicaOpt = { id: string; broj: number };

type ModalState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit"; editId: string };

export default function Page() {
  const [loading, setLoading] = useState(true);

  const [pcelinjaci, setPcelinjaci] = useState<PcelinjakOpt[]>([]);
  const [kosnice, setKosnice] = useState<KosnicaOpt[]>([]);

  const [pcelinjakId, setPcelinjakId] = useState("");
  const [kosnicaId, setKosnicaId] = useState("");

  const [sort, setSort] = useState<DnevnikSort>("datum_desc");
  const [dnevnici, setDnevnici] = useState<DnevnikItem[]>([]);

  const [modal, setModal] = useState<ModalState>({ open: false });
  const openAdd = () => setModal({ open: true, mode: "add" });
  const openEdit = (id: string) => setModal({ open: true, mode: "edit", editId: id });
  const close = () => setModal({ open: false });

  const isEdit = modal.open && modal.mode === "edit";
  const editItem = isEdit ? dnevnici.find((d) => d.id === modal.editId) : undefined;

  async function loadPcelinjaci() {
    const res = await fetch("/api/pcelinjaci");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Greška pri učitavanju pčelinjaka");

    setPcelinjaci(
      (data ?? []).map((p: any) => ({
        id: p.id,
        naziv: p.naziv,
        adresa: p.adresa ?? null,
      }))
    );
  }

  async function loadKosnice(forPcelinjakId: string) {
    if (!forPcelinjakId) {
      setKosnice([]);
      return;
    }

    const res = await fetch(`/api/pcelinjaci/${forPcelinjakId}/kosnice`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Greška pri učitavanju košnica");

    
    setKosnice(
      (data ?? []).map((k: any) => ({
        id: k.id,
        broj: Number(k.broj),
      }))
    );
  }

  async function loadDnevnici() {
    if (!pcelinjakId) {
      setDnevnici([]);
      return;
    }

    const qs = new URLSearchParams();
    qs.set("pcelinjakId", pcelinjakId);
    if (kosnicaId) qs.set("kosnicaId", kosnicaId);
    if (sort) qs.set("sort", sort);

    const res = await fetch(`/api/dnevnici?${qs.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Greška pri učitavanju dnevnika");

    setDnevnici(
      (data ?? []).map((d: any) => ({
        id: d.id,
        datum: d.datum,
        kolicinaMeda: d.kolicinaMeda == null ? null : Number(d.kolicinaMeda),
        pregled: d.pregled ?? null,
        komentar: d.komentar ?? null,
        kosnicaId: d.kosnicaId,
      }))
    );
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadPcelinjaci();
      } catch (e) {
        console.error(e);
        alert(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setKosnicaId("");
        await loadKosnice(pcelinjakId);
        await loadDnevnici();
      } catch (e) {
        console.error(e);
        alert(String(e));
      }
    })();
    
  }, [pcelinjakId]);

  useEffect(() => {
    (async () => {
      try {
        await loadDnevnici();
      } catch (e) {
        console.error(e);
        alert(String(e));
      }
    })();
    
  }, [kosnicaId, sort]);

  function resetFilters() {
    setKosnicaId("");
    setSort("datum_desc");
  }

  const selectedP = useMemo(
    () => pcelinjaci.find((p) => p.id === pcelinjakId) ?? null,
    [pcelinjaci, pcelinjakId]
  );

  const title = useMemo(() => {
    if (!pcelinjakId) return "Moj dnevnik";
    return selectedP ? `Moj dnevnik — ${selectedP.naziv}` : "Moj dnevnik";
  }, [pcelinjakId, selectedP]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/dnevnici/${id}`, { method: "DELETE" });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Neuspešno brisanje");
      await loadDnevnici();
    } catch (e) {
      console.error(e);
      alert(String(e));
    }
  }

  async function handleSubmit(data: NewDnevnikForm) {
    if (!modal.open) return;

    const payload = {
      kosnicaId: data.kosnicaId,
      datum: data.datum ? new Date(data.datum).toISOString() : undefined,
      kolicinaMeda: data.kolicinaMeda.trim() ? Number(data.kolicinaMeda) : null,
      pregled: data.pregled.trim() || null,
      komentar: data.komentar.trim() || null,
    };

    try {
      const res =
        modal.mode === "add"
          ? await fetch("/api/dnevnici", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/dnevnici/${modal.editId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Greška");

      close();
      await loadDnevnici();
    } catch (e) {
      console.error(e);
      alert(String(e));
    }
  }

  const initialForm = useMemo(() => {
    if (!editItem) return undefined;
    const d = editItem.datum ? new Date(editItem.datum) : null;

    return {
      datum: d ? d.toISOString().slice(0, 10) : "",
      kolicinaMeda: editItem.kolicinaMeda == null ? "" : String(editItem.kolicinaMeda),
      pregled: editItem.pregled ?? "",
      komentar: editItem.komentar ?? "",
      kosnicaId: editItem.kosnicaId,
    };
  }, [editItem]);

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
              <h1 className="text-3xl font-extrabold tracking-tight text-yellow-900">{title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Pregledi košnica, tretmani, prihrana i količina meda.
              </p>
            </div>

            <button
              onClick={openAdd}
              disabled={!kosnicaId}
              title={!kosnicaId ? "Izaberi košnicu da bi dodala unos" : "Dodaj unos"}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-sm font-bold text-orange-900 shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
            >
              <span className="text-lg leading-none">＋</span>
              Dodaj
            </button>
          </div>
        </div>

        <DnevnikSearch
          pcelinjaci={pcelinjaci.map((p) => ({ id: p.id, label: p.naziv }))}
          kosnice={kosnice.map((k) => ({ id: k.id, label: String(k.broj) }))}
          selectedPcelinjakId={pcelinjakId}
          selectedKosnicaId={kosnicaId}
          sort={sort}
          onChangePcelinjakId={setPcelinjakId}
          onChangeKosnicaId={setKosnicaId}
          onChangeSort={setSort}
          onReset={resetFilters}
          onDownload={() => {
            
            console.log("Preuzmi dnevnik klik");
          }}
        />

        <WeatherWidget address={selectedP?.adresa ?? null} />

        {loading ? (
          <div className="rounded-2xl bg-white/70 p-6 text-gray-700">Učitavanje...</div>
        ) : !pcelinjakId ? (
          <div className="rounded-3xl border border-yellow-200 bg-white/80 p-8 text-center shadow-sm">
            <div className="mb-3 text-4xl">📒</div>
            <h3 className="text-lg font-extrabold text-yellow-900">Izaberi pčelinjak</h3>
            <p className="mt-2 text-sm text-gray-600">
              Da bismo prikazali dnevnike, prvo izaberi pčelinjak (i košnicu).
            </p>
          </div>
        ) : dnevnici.length === 0 ? (
          <div className="rounded-3xl border border-yellow-200 bg-white/80 p-8 text-center shadow-sm">
            <div className="mb-3 text-4xl">🗒️</div>
            <h3 className="text-lg font-extrabold text-yellow-900">Nema unosa</h3>
            <p className="mt-2 text-sm text-gray-600">
              Trenutno nema unosa za izabrane filtere. Izaberi košnicu pa klikni “Dodaj”.
            </p>

            <button
              onClick={openAdd}
              disabled={!kosnicaId}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-sm font-extrabold text-orange-900 shadow-md hover:opacity-95 disabled:opacity-50"
            >
              <span className="text-lg leading-none">＋</span>
              Dodaj unos
            </button>
          </div>
        ) : (
          <ListaDnevnika dnevnici={dnevnici} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative z-10 w-full max-w-xl rounded-3xl border border-yellow-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-900">
                {isEdit ? "Izmena unosa" : "Novi unos"}
              </h2>
              <button onClick={close} className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
                ✕
              </button>
            </div>

            <NewDnevnik
              initial={isEdit ? initialForm : { kosnicaId }}
              kosnicaIdLocked={kosnicaId || undefined}
              onSubmit={handleSubmit}
              onCancel={close}
              submitLabel={isEdit ? "Sačuvaj izmene" : "Sačuvaj unos"}
            />
          </div>
        </div>
      )}
    </main>
  );
}

