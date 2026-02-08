"use client";

import { useEffect, useState } from "react";
import type { KorisnikPublic } from "@/shared/types";

type GetProfilResponse = {
    user: KorisnikPublic | null;
    message?: string;
};

export default function ProfilePanel() {
    const [user, setUser] = useState<KorisnikPublic | null>(null);

    const [ime, setIme] = useState("");
    const [prezime, setPrezime] = useState("");
    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [okMsg, setOkMsg] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        setOkMsg(null);

        try {
            const res = await fetch("/api/profil", { method: "GET" });

            const raw = await res.text();
            let out: GetProfilResponse;
            try {
                out = JSON.parse(raw);
            } catch {
                throw new Error("API nije vratio JSON (proveri /api/profil i da ne dobijaš 404 HTML).");
            }

            if (!res.ok) {
                throw new Error(out?.message || "Ne mogu da učitam profil.");
            }

            const u = out.user ?? null;
            setUser(u);

            setIme(u?.ime ?? "");
            setPrezime(u?.prezime ?? "");
            setEmail(u?.email ?? "");
        } catch (e: any) {
            setError(String(e?.message || e));
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function saveProfile() {
        setSavingProfile(true);
        setError(null);
        setOkMsg(null);

        try {
            const payload = {
                ime: ime.trim(),
                prezime: prezime.trim(),
                email: email.trim(),
            };

            const res = await fetch("/api/profil", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const raw = await res.text();
            let out: any = {};
            try {
                out = JSON.parse(raw);
            } catch {
                throw new Error("API nije vratio JSON (PUT /api/profil).");
            }

            if (!res.ok) {
                throw new Error(out?.message || out?.error || "Neuspešno čuvanje profila.");
            }

            setOkMsg("Profil uspešno sačuvan.");
            await load();
        } catch (e: any) {
            setError(String(e?.message || e));
        } finally {
            setSavingProfile(false);
        }
    }

    async function savePassword() {
        setSavingPassword(true);
        setError(null);
        setOkMsg(null);

        try {
            const payload = { currentPassword, newPassword, confirmPassword };

            const res = await fetch("/api/profil/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const raw = await res.text();
            let out: any = {};
            try {
                out = JSON.parse(raw);
            } catch {
                throw new Error("API nije vratio JSON (PATCH /api/profil/password).");
            }

            if (!res.ok) {
                throw new Error(out?.message || out?.error || "Neuspešna promena šifre.");
            }

            setOkMsg("Šifra uspešno promenjena.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (e: any) {
            setError(String(e?.message || e));
        } finally {
            setSavingPassword(false);
        }
    }

    if (loading) {
        return (
            <div className="rounded-2xl bg-white/80 p-6 text-gray-800 shadow-sm backdrop-blur">
                Učitavanje...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {okMsg && (
                <div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-green-800">
                    {okMsg}
                </div>
            )}

            <div className="rounded-3xl border border-yellow-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-extrabold text-gray-900">Moj profil</h2>
                        <p className="mt-1 text-sm text-gray-700">
                            Uloga: <span className="font-bold">{user?.uloga ?? "-"}</span>
                            {user?.createdAt ? (
                                <>
                                    {" "}
                                    • Kreiran: <span className="font-semibold">{String(user.createdAt).slice(0, 10)}</span>
                                </>
                            ) : null}
                        </p>
                    </div>

                    <button
                        onClick={load}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                    >
                        Osveži
                    </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Ime</label>
                        <input
                            value={ime}
                            onChange={(e) => setIme(e.target.value)}
                            className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            placeholder="Ime"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Prezime</label>
                        <input
                            value={prezime}
                            onChange={(e) => setPrezime(e.target.value)}
                            className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            placeholder="Prezime"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-bold text-gray-700">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            placeholder="Email"
                        />
                    </div>
                </div>

                <div className="mt-5">
                    <button
                        onClick={saveProfile}
                        disabled={savingProfile}
                        className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                    >
                        {savingProfile ? "Čuvam..." : "Sačuvaj profil"}
                    </button>
                </div>
            </div>


            <div className="rounded-3xl border border-yellow-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                <h2 className="text-lg font-extrabold text-gray-900">Promena šifre</h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-bold text-gray-700">Trenutna šifra</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            placeholder="Trenutna šifra"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Nova šifra</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            placeholder="Nova šifra"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Potvrdi novu šifru</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            placeholder="Potvrda"
                        />
                    </div>
                </div>

                <div className="mt-5">
                    <button
                        onClick={savePassword}
                        disabled={savingPassword}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-orange-700 ring-1 ring-orange-200 hover:bg-orange-50 disabled:opacity-60"
                    >
                        {savingPassword ? "Menjam..." : "Promeni šifru"}
                    </button>
                </div>
            </div>
        </div>
    );
}
