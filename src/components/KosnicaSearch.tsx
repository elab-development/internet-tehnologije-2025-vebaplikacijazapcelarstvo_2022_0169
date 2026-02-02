"use client";

export default function KosnicaSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-6 rounded-3xl border border-yellow-200/70 bg-white/70 p-4 shadow-sm backdrop-blur">
      <label className="mb-2 block text-sm font-semibold text-gray-800">
        Pretraga
      </label>

      <div className="flex items-center gap-3">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="npr. 3, LR..."
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
