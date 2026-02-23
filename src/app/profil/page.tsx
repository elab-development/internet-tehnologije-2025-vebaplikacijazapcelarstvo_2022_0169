"use client";

import { useEffect, useState } from "react";
import ProfilePanel from "@/components/ProfilePanel";
import PcelinjaciMap from "@/components/PcelinjaciMap";
import type { UserRole } from "@/shared/types";

export default function Page() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) {
          setRole(null);
          return;
        }
        const data = await res.json();

        
        const r = (data?.role ?? data?.uloga ?? null) as UserRole | null;
        setRole(r);
      } catch {
        setRole(null);
      } finally {
        setLoadingRole(false);
      }
    })();
  }, []);

  const showMap = !loadingRole && role === "PCELAR";

  return (
    <main
      className="min-h-screen px-4 py-8"
      style={{
        backgroundImage: "url(/pozadina.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-3xl border border-yellow-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-extrabold tracking-tight text-yellow-900">
            Profil
          </h1>
          <p className="mt-1 text-sm text-gray-700">
            Pregled i izmena osnovnih podataka i šifre.
          </p>
        </div>

        <ProfilePanel />

        {showMap && (
          <div className="mt-6">
            <PcelinjaciMap />
          </div>
        )}
      </div>
    </main>
  );
}