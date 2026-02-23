"use client";

import type { UserRole } from "@/shared/types";

export type UserFormData = {
  ime: string;
  prezime: string;
  email: string;
  uloga: UserRole;
  sifra?: string;
};

export default function UserFormModal({
  open,
  mode,
  data,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  data: UserFormData;
  onChange: (v: UserFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-yellow-200/70 bg-white/90 p-6 shadow-2xl backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-yellow-950">
            {mode === "create" ? "Novi korisnik" : "Izmena korisnika"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">Ime</label>
            <input
              value={data.ime}
              onChange={(e) => onChange({ ...data, ime: e.target.value })}
              className="w-full rounded-2xl border border-yellow-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">Prezime</label>
            <input
              value={data.prezime}
              onChange={(e) => onChange({ ...data, prezime: e.target.value })}
              className="w-full rounded-2xl border border-yellow-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-gray-800">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ ...data, email: e.target.value })}
              className="w-full rounded-2xl border border-yellow-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">Uloga</label>
            <select
              value={data.uloga}
              onChange={(e) => onChange({ ...data, uloga: e.target.value as UserRole })}
              className="w-full rounded-2xl border border-yellow-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="PCELAR">PCELAR</option>
              <option value="POLJOPRIVREDNIK">POLJOPRIVREDNIK</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">
              {mode === "create" ? "Šifra" : "Nova šifra (opciono)"}
            </label>
            <input
              type="password"
              value={data.sifra ?? ""}
              onChange={(e) => onChange({ ...data, sifra: e.target.value })}
              className="w-full rounded-2xl border border-yellow-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
            />
          </div>
        </div>

        {mode === "edit" && (
          <p className="mt-3 text-xs text-gray-700">
            Ako ostaviš polje za šifru prazno, postojeća šifra se ne menja.
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Otkaži
          </button>

          <button
            onClick={onSubmit}
            className="rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-2 text-sm font-extrabold text-orange-900 shadow-md hover:opacity-95"
          >
            Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}