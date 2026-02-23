"use client";

import type { UserRole } from "@/shared/types";

export default function UsersFilter({
  search,
  role,
  onSearchChange,
  onRoleChange,
  onReset,
}: {
  search: string;
  role: UserRole | "ALL";
  onSearchChange: (v: string) => void;
  onRoleChange: (v: UserRole | "ALL") => void;
  onReset: () => void;
}) {
  return (
    <div className="mb-6 rounded-3xl border border-yellow-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_260px_auto] md:items-end">
        <div>
          <label className="mb-2 block text-sm font-semibold text-yellow-900">
            Pretraga
          </label>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ime, prezime ili email…"
            className="h-11 w-full rounded-2xl border border-yellow-200 bg-white/80 px-4 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-yellow-900">
            Uloga
          </label>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value as any)}
            className="h-11 w-full rounded-2xl border border-yellow-200 bg-white/80 px-4 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
          >
            <option value="ALL">Sve</option>
            <option value="ADMIN">ADMIN</option>
            <option value="PCELAR">PCELAR</option>
            <option value="POLJOPRIVREDNIK">POLJOPRIVREDNIK</option>
          </select>
        </div>

        <button
          onClick={onReset}
          className="h-11 rounded-2xl border border-yellow-200 bg-white/80 px-5 text-sm font-semibold text-yellow-900 shadow-sm transition hover:bg-white"
        >
          Reset
        </button>
      </div>
    </div>
  );
}