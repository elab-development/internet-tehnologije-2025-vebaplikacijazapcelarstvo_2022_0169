"use client";

import { useEffect, useMemo, useState } from "react";
import DnevnikSearch, { type DnevnikSort } from "@/components/DnevnikSearch";
import WeatherWidget from "@/components/WeatherWidget";

type PcelinjakOpt = { id: string; naziv: string; adresa: string | null };
type KosnicaOpt = { id: string; naziv: string };

type DnevnikItem = {
  id: string;
  datum: string;
  pregled?: string | null;
  komentar?: string | null;
  kolicinaMeda?: string | null;
  slika?: string | null;
  kosnicaId: string;
};

export default function Page() {
  const [loading, setLoading] = useState(true);

  const [pcelinjaci, setPcelinjaci] = useState<PcelinjakOpt[]>([]);
  const [kosnice, setKosnice] = useState<KosnicaOpt[]>([]);

  const [pcelinjakId, setPcelinjakId] = useState("");
  const [kosnicaId, setKosnicaId] = useState("");

  const [sort, setSort] = useState<DnevnikSort>("datum_desc");
  const [dnevnici, setDnevnici] = useState<DnevnikItem[]>([]);

  async function loadPcelinjaci() {
    const res = await fetch("/api/pcelinjaci", { method: "GET" });
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

    const res = await fetch(`/api/pcelinjaci/${forPcelinjakId}/kosnice`, { method: "GET" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Greška pri učitavanju košnica");

    setKosnice((data ?? []).map((k: any) => ({ id: k.id, naziv: k.naziv ?? "Košnica" })));
  }

  async function loadDnevniciPlaceholder() {
    setDnevnici([]);
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
        await loadDnevniciPlaceholder();
      } catch (e) {
        console.error(e);
        alert(String(e));
      }
    })();
  }, [pcelinjakId]);

  useEffect(() => {
    loadDnevniciPlaceholder();
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
    return selectedP ? `Dnevnik — ${selectedP.naziv}` : "Moj dnevnik";
  }, [pcelinjakId, selectedP]);

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
          <h1 className="text-3xl font-extrabold tracking-tight text-yellow-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Pregledi košnica, tretmani, prihrana, količina meda, slike i lični komentari.
          </p>
        </div>

        <DnevnikSearch
          pcelinjaci={pcelinjaci.map((p) => ({ id: p.id, naziv: p.naziv }))}
          kosnice={kosnice}
          selectedPcelinjakId={pcelinjakId}
          selectedKosnicaId={kosnicaId}
          sort={sort}
          onChangePcelinjakId={setPcelinjakId}
          onChangeKosnicaId={setKosnicaId}
          onChangeSort={setSort}
          onReset={resetFilters}
        />

        <WeatherWidget address={selectedP?.adresa ?? null} />

        {loading ? (
          <div className="rounded-2xl bg-white/70 p-6 text-gray-700">Učitavanje...</div>
        ) : !pcelinjakId ? (
          <div className="rounded-3xl border border-yellow-200 bg-white/80 p-8 text-center shadow-sm">
            <div className="mb-3 text-4xl">📒</div>
            <h3 className="text-lg font-extrabold text-yellow-900">Izaberi pčelinjak</h3>
            <p className="mt-2 text-sm text-gray-600">
              Da bismo prikazali dnevnike, prvo izaberi pčelinjak (i opciono košnicu).
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-yellow-200 bg-white/80 p-8 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-gray-800">Dnevnici (uskoro)</div>
            <p className="text-sm text-gray-600">
              Sledeće implementiramo: kartice dnevnika + forma za kreiranje + poziv /api/dnevnici.
            </p>

            {dnevnici.length === 0 && (
              <div className="mt-4 rounded-2xl bg-white p-5 text-gray-700">
                Trenutno nema unosa za izabrane filtere.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
