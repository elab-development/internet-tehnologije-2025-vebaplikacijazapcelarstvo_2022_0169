"use client";

import { useEffect, useMemo, useState } from "react";
import UsersFilter from "@/components/UsersFilter";
import UsersTable, { UserRow } from "@/components/UsersTable";
import UserFormModal, { UserFormData } from "@/components/UserFormModal";
import type { UserRole } from "@/shared/types";

function norm(s: string) {
  return String(s)
    .toLocaleLowerCase("sr-RS")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function toUserRole(v: unknown): UserRole {
  const r = String(v ?? "").trim().toUpperCase();
  if (r === "ADMIN") return "ADMIN";
  if (r === "PCELAR") return "PCELAR";
  return "POLJOPRIVREDNIK";
}

export default function Page() {
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "ALL">("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<UserFormData>({
    ime: "",
    prezime: "",
    email: "",
    uloga: "POLJOPRIVREDNIK",
    sifra: "",
  });

  async function load() {
    const res = await fetch("/api/korisnici", { cache: "no-store" });
    const data = await res.json();
    setAllUsers(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  const users = useMemo(() => {
    const q = norm(search);
    const wantRole = role === "ALL" ? null : role;

    return allUsers.filter((u) => {
      const uRole = toUserRole(u.uloga);
      if (wantRole && uRole !== wantRole) return false;
      if (!q) return true;

      const hay = norm(`${u.ime} ${u.prezime} ${u.email} ${u.uloga}`);
      return hay.includes(q);
    });
  }, [allUsers, search, role]);

  function resetFilters() {
    setSearch("");
    setRole("ALL");
  }

  function openCreate() {
    setMode("create");
    setEditId(null);
    setForm({
      ime: "",
      prezime: "",
      email: "",
      uloga: "POLJOPRIVREDNIK",
      sifra: "",
    });
    setModalOpen(true);
  }

  function openEdit(u: UserRow) {
    setMode("edit");
    setEditId(u.id);
    setForm({
      ime: u.ime,
      prezime: u.prezime,
      email: u.email,
      uloga: toUserRole(u.uloga),
      sifra: "",
    });
    setModalOpen(true);
  }

  async function submit() {
    const url = mode === "create" ? "/api/korisnici" : `/api/korisnici/${editId}`;
    const method = mode === "create" ? "POST" : "PUT";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setModalOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Obrisati korisnika?")) return;
    await fetch(`/api/korisnici/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main
      className="min-h-screen px-4 py-8"
      style={{
        backgroundImage: "url(/pozadina.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl border border-yellow-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-yellow-900">
                Upravljanje korisnicima
              </h1>
              <p className="mt-1 text-sm text-gray-700">
                Pretraga i upravljanje korisnicima aplikacije.
              </p>
            </div>

            <button
              onClick={openCreate}
              className="rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-2 text-sm font-extrabold text-orange-900 shadow-md hover:opacity-95"
            >
              + Novi korisnik
            </button>
          </div>
        </div>

        <UsersFilter
          search={search}
          role={role}
          onSearchChange={setSearch}
          onRoleChange={setRole}
          onReset={resetFilters}
        />

        <UsersTable users={users} onEdit={openEdit} onDelete={remove} />

        <UserFormModal
          open={modalOpen}
          mode={mode}
          data={form}
          onChange={setForm}
          onClose={() => setModalOpen(false)}
          onSubmit={submit}
        />
      </div>
    </main>
  );
}