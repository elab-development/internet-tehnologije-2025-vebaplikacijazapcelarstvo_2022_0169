import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getRoleFromCookies } from "@/lib/auth";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Veb Pčelarstvo",
  description: "Sistem za evidenciju pčelinjaka, aktivnosti i dnevnika pregleda.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRoleFromCookies();

  return (
    <html lang="sr" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">

        <Header role={role} />
        {children}

      </body>
    </html>
  );
}

