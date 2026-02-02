"use client";

import { useEffect, useState } from "react";
import type { KosnicaUpdateDTO } from "@/shared/types";

export type NewKosnicaForm = {
  broj: string;
  tip: string;
  starostMatice: string;
  brNastavaka: string;
};

function toNumberOrNull(v: string): number | null {
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function NewKosnica({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Partial<NewKosnicaForm>;
  onSubmit: (data: KosnicaUpdateDTO) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [broj, setBroj] = useState(initial?.broj ?? "");
  const [tip, setTip] = useState(initial?.tip ?? "");
  const [starostMatice, setStarostMatice] = useState(initial?.starostMatice ?? "");
  const [brNastavaka, setBrNastavaka] = useState(initial?.brNastavaka ?? "");

  useEffect(() => {
    setBroj(initial?.broj ?? "");
    setTip(initial?.tip ?? "");
    setStarostMatice(initial?.starostMatice ?? "");
    setBrNastavaka(initial?.brNastavaka ?? "");
  }, [initial]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        const brojNum = toNumberOrNull(broj);
        if (brojNum == null || brojNum <= 0) {
          alert("Broj košnice mora biti pozitivan broj.");
          return;
        }

        const payload: KosnicaUpdateDTO = {
          broj: brojNum,
          tip: tip.trim() === "" ? null : tip.trim(),
          starostMatice: toNumberOrNull(starostMatice),
          brNastavaka: toNumberOrNull(brNastavaka),
        };

        onSubmit(payload);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-gray-700">Broj *</label>
          <input
            value={broj}
            onChange={(e) => setBroj(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="npr. 1"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Tip</label>
          <input
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="npr. LR"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Starost matice</label>
          <input
            value={starostMatice}
            onChange={(e) => setStarostMatice(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="npr. 2"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Broj nastavaka</label>
          <input
            value={brNastavaka}
            onChange={(e) => setBrNastavaka(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="npr. 3"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
        >
          Otkaži
        </button>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-2 text-sm font-bold text-white shadow hover:opacity-95"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
