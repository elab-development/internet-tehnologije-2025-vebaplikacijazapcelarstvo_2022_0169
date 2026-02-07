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
            <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white/80 p-4 backdrop-blur-sm">
                <h1 className="mb-4 text-2xl font-bold text-gray-900">
                    Aktivnosti
                </h1>

                <AktivnostiTable />
            </div>
        </main>
    );
}
