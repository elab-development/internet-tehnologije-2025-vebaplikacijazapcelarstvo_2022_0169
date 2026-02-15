"use client";

import { useEffect, useState } from "react";

export type NewDnevnikForm = {
  datum: string; 
  kolicinaMeda: string; 
  pregled: string;
  komentar: string;
  kosnicaId: string;
};

const empty: NewDnevnikForm = {
  datum: "",
  kolicinaMeda: "",
  pregled: "",
  komentar: "",
  kosnicaId: "",
};

export default function NewDnevnik({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Sačuvaj",
  kosnicaIdLocked,
}: {
  initial?: Partial<NewDnevnikForm>;
  onSubmit: (data: NewDnevnikForm) => void;
  onCancel?: () => void;
  submitLabel?: string;
  kosnicaIdLocked?: string;
}) {
  const [form, setForm] = useState<NewDnevnikForm>({ ...empty, ...(initial ?? {}) });

  useEffect(() => {
    setForm({ ...empty, ...(initial ?? {}) });
  }, [initial]);

  useEffect(() => {
    if (kosnicaIdLocked) setForm((p) => ({ ...p, kosnicaId: kosnicaIdLocked }));
  }, [kosnicaIdLocked]);

  function update<K extends keyof NewDnevnikForm>(k: K, v: NewDnevnikForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.kosnicaId) return alert("Izaberi košnicu.");
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-yellow-900">
        📒 Unos u dnevnik
      </h3>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">Datum</label>
          <input
            type="date"
            value={form.datum}
            onChange={(e) => update("datum", e.target.value)}
            className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">Količina meda (kg)</label>
          <input
            value={form.kolicinaMeda}
            onChange={(e) => update("kolicinaMeda", e.target.value)}
            className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="npr. 10.50"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-bold text-gray-700">Pregled</label>
        <input
          value={form.pregled}
          onChange={(e) => update("pregled", e.target.value)}
          className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          placeholder="npr. pregled stanja, tretman..."
        />
      </div>

      <div className="mb-5">
        <label className="mb-1 block text-sm font-bold text-gray-700">Komentar</label>
        <textarea
          value={form.komentar}
          onChange={(e) => update("komentar", e.target.value)}
          className="min-h-[90px] w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          placeholder="Lični komentar..."
        />
      </div>

      {/* kosnicaId (zaključan kroz kosnicaIdLocked) */}
      <input type="hidden" value={form.kosnicaId} readOnly />

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
