"use client";

export type Option = { id: string; label: string };

export type DnevnikSort = "datum_desc" | "datum_asc";

export default function DnevnikSearch({
  pcelinjaci,
  kosnice,
  selectedPcelinjakId,
  selectedKosnicaId,
  sort,
  onChangePcelinjakId,
  onChangeKosnicaId,
  onChangeSort,
  onReset,
  onDownload,
}: {
  pcelinjaci: Option[];
  kosnice: Option[];

  selectedPcelinjakId: string;
  selectedKosnicaId: string;

  sort: DnevnikSort;

  onChangePcelinjakId: (id: string) => void;
  onChangeKosnicaId: (id: string) => void;
  onChangeSort: (v: DnevnikSort) => void;

  onReset: () => void;

  
  onDownload: () => void;
}) {
  return (
    <div className="mb-6 rounded-3xl border border-yellow-200/70 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Filteri dnevnika
          </label>
          <p className="mt-1 text-xs text-gray-600">
            Izaberi pčelinjak, košnicu i sortiranje po datumu.
          </p>
        </div>

        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-900 shadow-sm hover:bg-yellow-200 active:scale-[0.99]"
        >
          ⬇️ Preuzmi
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
       
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Pčelinjak
          </label>
          <select
            value={selectedPcelinjakId}
            onChange={(e) => onChangePcelinjakId(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">— Izaberi pčelinjak —</option>
            {pcelinjaci.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

       
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Košnica
          </label>
          <select
            value={selectedKosnicaId}
            onChange={(e) => onChangeKosnicaId(e.target.value)}
            disabled={!selectedPcelinjakId}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
          >
            <option value="">— Sve košnice —</option>
            {kosnice.map((k) => (
              <option key={k.id} value={k.id}>
                Košnica #{k.label}
              </option>
            ))}
          </select>
        </div>

        
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Sortiranje
          </label>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => onChangeSort(e.target.value as DnevnikSort)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="datum_desc">Najnovije prvo</option>
              <option value="datum_asc">Najstarije prvo</option>
            </select>

            <button
              type="button"
              onClick={onReset}
              className="shrink-0 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}