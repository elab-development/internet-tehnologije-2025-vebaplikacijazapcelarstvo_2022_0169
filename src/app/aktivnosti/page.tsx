"use client";

import AktivnostiTable from "@/components/AktivnostiTable";

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
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 rounded-3xl border border-yellow-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-yellow-900">
                                Aktivnosti
                            </h1>
                            <p className="mt-1 text-sm text-gray-700">
                                Sezonske i poljoprivredne aktivnosti + tvoje privatne aktivnosti.
                            </p>
                        </div>
                    </div>
                </div>

                <AktivnostiTable />
            </div>
        </main>
    );
}
