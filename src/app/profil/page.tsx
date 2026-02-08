"use client";

import ProfilePanel from "@/components/ProfilePanel";

export default function Page() {
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
            </div>
        </main>
    );
}
