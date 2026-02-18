"use client";

import type { DnevnikItem } from "./ListaDnevnika";

export default function DnevnikCard({
  d,
  onEdit,
  onDelete,
}: {
  d: DnevnikItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const date = d.datum ? new Date(d.datum) : null;

  
  const dateLabel = date
    ? date.toLocaleDateString("sr-Latn-RS", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const treatLabel = d.pregled?.trim() ? d.pregled : "Bez opisa tretmana";
  const commentLabel = d.komentar?.trim() ? d.komentar : "—";
  const honeyLabel = d.kolicinaMeda ?? "—";

  return (
    <article
      className="relative overflow-hidden rounded-[26px] border border-yellow-300/70 shadow-md transition hover:shadow-xl"
      style={{
        backgroundImage: "url(/dnevnik.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/70 to-yellow-50/60" />
      
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-multiply" />

      <div className="relative p-6 md:p-7">
      
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/70 bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-900">
              <span aria-hidden>📒</span>
              <span>Dnevnik</span>
            </div>

            <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
              {dateLabel}
            </h3>

            
            <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-black/5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
                Pregled
              </span>
              <span className="truncate text-gray-900">{treatLabel}</span>
            </div>
          </div>

        
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit?.(d.id);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 hover:bg-white"
            >
              <span aria-hidden>✏️</span>
              <span className="hidden sm:inline">Izmeni</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const ok = window.confirm("Da li sigurno želiš da obrišeš ovaj unos iz dnevnika?");
                if (ok) onDelete?.(d.id);
              }}
              className="inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-black/5 hover:bg-red-50"
              title="Obriši unos"
            >
              🗑️
            </button>
          </div>
        </div>

       
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          
          <section className="md:col-span-2 rounded-2xl bg-white/85 p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Komentar
              </p>
              <span className="text-[11px] font-semibold text-gray-500">
                {date ? date.toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-gray-900">
              {commentLabel}
            </p>
          </section>

          {/* MED */}
          <aside className="flex items-stretch">
            <div className="w-full rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 p-5 shadow-sm ring-1 ring-yellow-300/60">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Med
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  🍯
                </span>
                <span className="text-lg font-extrabold text-amber-900">
                  {honeyLabel}{" "}
                  <span className="text-sm font-bold text-amber-800">kg</span>
                </span>
              </div>

              <p className="mt-3 text-xs text-amber-900/80">
                Evidencija prinosa iz ovog unosa.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
