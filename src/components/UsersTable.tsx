"use client";

import type { UserRole } from "@/shared/types";

export type UserRow = {
  id: string;
  ime: string;
  prezime: string;
  email: string;
  uloga: UserRole | string;
};

function roleLabel(r: unknown) {
  return String(r ?? "").trim().toUpperCase();
}

export default function UsersTable({
  users,
  onEdit,
  onDelete,
}: {
  users: UserRow[];
  onEdit: (u: UserRow) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-yellow-200/70 bg-white/75 shadow-sm backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-yellow-50/80 text-left">
            <tr className="text-yellow-950">
              <th className="px-6 py-4 font-bold">Ime</th>
              <th className="px-6 py-4 font-bold">Prezime</th>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">Uloga</th>
              <th className="px-6 py-4 text-right font-bold">Akcije</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-yellow-200/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-yellow-50/40">
                <td className="px-6 py-4">{u.ime}</td>
                <td className="px-6 py-4">{u.prezime}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-900">
                    {roleLabel(u.uloga)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => onEdit(u)}
                      className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Izmeni
                    </button>
                    <button
                      onClick={() => onDelete(u.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                    >
                      Obriši
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-600">
                  Nema korisnika za izabrane filtere
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}