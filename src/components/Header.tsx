"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";

type NavItem = { label: string; href: string };

function navByRole(role: UserRole | null): NavItem[] {
  if (!role) return [];

  switch (role) {
    case "PCELAR":
      return [
        { label: "Moj pčelinjak", href: "/pcelinjak" },
        { label: "Aktivnosti", href: "/aktivnosti" },
        { label: "Moj dnevnik", href: "/dnevnik" },
        { label: "Profil", href: "/profil" },
      ];
    case "ADMIN":
      return [
        { label: "Aktivnosti", href: "/admin/aktivnosti" },
        { label: "Profili", href: "/admin/korisnici" },
        { label: "Profil", href: "/profil" },
      ];
    case "POLJOPRIVREDNIK":
      return [
        { label: "Aktivnosti", href: "/aktivnosti" },
        { label: "Profil", href: "/profil" },
      ];
    default:
      return [];
  }
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative rounded-xl px-3 py-2 text-sm font-semibold transition",
        "text-white/95 hover:text-white",
        active
          ? "bg-white/15 shadow-sm"
          : "hover:bg-white/10",
      ].join(" ")}
    >
      {label}
      <span
        className={[
          "pointer-events-none absolute left-3 right-3 -bottom-[2px] h-[2px] rounded-full transition-all duration-300",
          active ? "bg-white" : "bg-white/0 group-hover:bg-white/70",
        ].join(" ")}
      />
    </Link>
  );
}

export default function Header({ role }: { role: UserRole | null }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const items = navByRole(role);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glass + honey gradient, uklopljen sa hero */}
      <div className="border-b border-white/15 bg-gradient-to-r from-yellow-400/60 via-amber-400/55 to-orange-400/60 backdrop-blur-xl shadow-[0_10px_24px_rgba(0,0,0,0.10)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12 md:h-14 md:w-14">
              <Image
                src="/logo.png"
                alt="Veb Pčelarstvo logo"
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </div>


            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-wide text-white drop-shadow">
                  Veb Pčelarstvo
                </span>
                <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white md:inline">
                  🐝 evidencija bez papira
                </span>
              </div>

              <div className="text-xs text-white/85">
                Pčelinjak • Aktivnosti • Dnevnik
              </div>
            </div>
          </Link>

          {/* Landing buttons (samo na / kad nema role) */}
          {!role && isLanding ? (
            <div className="flex items-center gap-3">
              <Link
                href="/prijava"
                className="rounded-2xl bg-white/95 px-4 py-2 text-sm font-semibold text-orange-700 shadow hover:scale-[1.03] transition"
              >
                Prijavi se
              </Link>

              <Link
                href="/registracija"
                className="rounded-2xl border-2 border-white/80 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white hover:text-orange-700 hover:scale-[1.03] transition"
              >
                Registruj se
              </Link>
            </div>
          ) : (
            <nav className="flex items-center gap-1 md:gap-2">
              {items.map((it) => (
                <NavLink
                  key={it.href}
                  href={it.href}
                  label={it.label}
                  active={pathname === it.href}
                />
              ))}

              {role && (
                <Link
                  href="/odjava"
                  className="ml-2 rounded-2xl bg-white/95 px-4 py-2 text-sm font-semibold text-orange-700 shadow hover:scale-[1.03] transition"
                >
                  Odjavi se
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
