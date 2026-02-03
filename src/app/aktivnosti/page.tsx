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
                <div className="rounded-3xl border border-yellow-200/70 bg-white/70 p-6 shadow-sm backdrop-blur">
                    <h1 className="text-3xl font-extrabold tracking-tight text-yellow-900">
                        Stranica u pripremi...
                    </h1>
                </div>
            </div>
        </main>
    );
}
