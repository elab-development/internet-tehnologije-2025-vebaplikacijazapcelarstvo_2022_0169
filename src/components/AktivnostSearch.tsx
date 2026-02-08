"use client";

export default function AktivnostSearch({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="mb-4 rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm backdrop-blur">
            <label className="mb-2 block text-sm font-extrabold text-gray-800">
                Pretraga
            </label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Naziv ili opis..."
                className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
        </div>
    );
}
