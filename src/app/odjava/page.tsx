"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OdjavaPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await fetch("/api/auth/logout", { method: "POST" });

      router.replace("/");   // vrati na početnu
      router.refresh();      // natera server komponente (Header) da pročitaju nove cookies
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <p className="text-orange-900/70">Odjavljujem te…</p>
    </main>
  );
}

