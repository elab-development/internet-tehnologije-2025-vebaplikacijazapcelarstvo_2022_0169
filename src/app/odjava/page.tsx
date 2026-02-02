"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function OdjavaPage() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;     
    ran.current = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
          cache: "no-store",
        });

        
      } catch (e) {
      
        console.error("Logout fetch error:", e);
      } finally {
        router.replace("/");
        router.refresh();
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <p className="text-orange-900/70">Odjavljujem te…</p>
    </main>
  );
}
