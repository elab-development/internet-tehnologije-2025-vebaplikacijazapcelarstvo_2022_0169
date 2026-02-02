"use client";

import type { Kosnica } from "@/shared/types";

export default function KosnicaCard({
  k,
  onEdit,
  onDelete,
}: {
  k: Kosnica;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[26px] border border-yellow-200 bg-white/70 shadow-lg transition hover:shadow-xl"
      style={{
        backgroundImage: "url(/kosnicaCard.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/35" />

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100/90 px-3 py-1 text-xs font-semibold text-yellow-900 shadow-sm">
            🍯 Košnica
          </span>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit?.(k.id);
              }}
              className="rounded-full bg-white/90 px-3 py-2 text-sm shadow hover:bg-white"
              title="Izmeni"
            >
              ✏️
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const ok = window.confirm(
                  `Da li sigurno želiš da obrišeš košnicu #${k.broj}?`
                );
                if (ok) onDelete?.(k.id);
              }}
              className="rounded-full bg-white/90 px-3 py-2 text-sm text-red-600 shadow hover:bg-white"
              title="Obriši"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">Košnica</h3>
            <p className="text-sm text-gray-700">
              Tip: <span className="font-semibold">{k.tip ?? "—"}</span>
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-yellow-400/60 to-orange-400/60 blur-sm" />
            <div className="relative rounded-2xl bg-white/90 px-4 py-2 text-center shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Broj
              </p>
              <p className="text-3xl font-extrabold text-yellow-700 leading-none">
                {k.broj}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Starost matice
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {k.starostMatice ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Broj nastavaka
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {k.brNastavaka ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Datum
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {k.datum ? new Date(k.datum).toLocaleString("sr-RS") : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
