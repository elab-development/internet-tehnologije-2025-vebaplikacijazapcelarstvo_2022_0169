"use client";

import { useMemo, useState } from "react";

type PcelinjakOpt = { id: string; naziv: string };
type KosnicaOpt = { id: string; broj: number };

export type IzvestajParams = {
  pcelinjakId: string;
  kosnicaId: string | null; 
  dateFrom: string; 
  dateTo: string;   
};

function todayStrLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function IzvestajForm({
  open,
  pcelinjaci,
  kosnice,
  initialPcelinjakId,
  initialKosnicaId,
  onClose,
  onSubmit,
}: {
  open: boolean;

  pcelinjaci: PcelinjakOpt[];
  kosnice: KosnicaOpt[];

  initialPcelinjakId: string;
  initialKosnicaId: string;   
  onClose: () => void;

  
  onSubmit: (params: IzvestajParams) => Promise<void> | void;
}) {
  const todayStr = useMemo(() => todayStrLocal(), []);

  const [pcelinjakId, setPcelinjakId] = useState(initialPcelinjakId || "");
  const [kosnicaId, setKosnicaId] = useState(initialKosnicaId || "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  
  useMemo(() => {
    if (!open) return;
    setErr("");
    setSubmitting(false);
    setPcelinjakId(initialPcelinjakId || "");
    setKosnicaId(initialKosnicaId || "");
    setDateFrom("");
    setDateTo("");
    
  }, [open, initialPcelinjakId, initialKosnicaId]);

  async function handleSubmit() {
    setErr("");

    if (!pcelinjakId) {
      setErr("Moraš izabrati pčelinjak.");
      return;
    }
    if (!dateFrom || !dateTo) {
      setErr("Moraš uneti oba datuma (od i do).");
      return;
    }

    
    if (dateFrom > todayStr || dateTo > todayStr) {
      setErr("Oba datuma moraju biti u prošlosti (ili najkasnije danas).");
      return;
    }

    if (dateFrom > dateTo) {
      setErr("Datum 'od' ne može biti posle datuma 'do'.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        pcelinjakId,
        kosnicaId: kosnicaId ? kosnicaId : null,
        dateFrom,
        dateTo,
      });
    } catch (e: any) {
      setErr(e?.message ?? "Greška pri generisanju izveštaja.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && onClose()} />

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-yellow-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900">Izveštaj (PDF)</h2>

          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-60"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-800">Pčelinjak</label>
            <select
              value={pcelinjakId}
              onChange={(e) => {
                setPcelinjakId(e.target.value);
                setKosnicaId(""); // reset košnice
              }}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">— Izaberi pčelinjak —</option>
              {pcelinjaci.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.naziv}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Košnica (opciono)
            </label>
            <select
              value={kosnicaId}
              onChange={(e) => setKosnicaId(e.target.value)}
              disabled={!pcelinjakId}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
            >
              <option value="">— Sve košnice —</option>
              {kosnice.map((k) => (
                <option key={k.id} value={k.id}>
                  Košnica #{k.broj}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              Ako ne izabereš košnicu → izveštaj ide za sve košnice tog pčelinjaka.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Datum od</label>
            <input
              type="date"
              value={dateFrom}
              max={todayStr}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Datum do</label>
            <input
              type="date"
              value={dateTo}
              max={todayStr}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {err}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Otkaži
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-2xl border border-yellow-300 bg-yellow-100 px-4 py-3 text-sm font-semibold text-yellow-900 shadow-sm hover:bg-yellow-200 disabled:opacity-60"
          >
            {submitting ? "Generišem..." : "Generiši PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}