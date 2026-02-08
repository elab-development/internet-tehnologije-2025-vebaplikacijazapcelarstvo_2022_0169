"use client";

export type AktivnostItem = {
    id: string;
    naziv: string;
    opis: string | null;
    tip: "SEZONSKA" | "PCELAR" | "POLJOPRIVREDNIK";
    datum: string | null; // ISO
    uradjen: boolean;

    // ✅ prava po redu (server računa)
    canEdit: boolean;
    canDelete: boolean;
};

export default function ListaAktivnosti({
    aktivnosti,
    onRowClick,
    onDelete,
    onToggleDone,
}: {
    aktivnosti: AktivnostItem[];
    onRowClick: (a: AktivnostItem) => void;
    onDelete: (id: string) => void;
    onToggleDone: (id: string, checked: boolean) => void;
}) {
    return (
        <div className="overflow-x-auto rounded-3xl border border-yellow-200 bg-white/80 shadow-sm backdrop-blur">
            <table className="w-full border-collapse text-gray-900">
                <thead>
                    <tr className="bg-yellow-100 text-left text-gray-900">
                        <th className="p-3">Naziv</th>
                        <th className="p-3">Tip</th>
                        <th className="p-3">Opis</th>
                        <th className="p-3">Datum</th>
                        <th className="p-3 text-center">Urađeno</th>
                        <th className="p-3 text-right">Akcije</th>
                    </tr>
                </thead>

                <tbody>
                    {aktivnosti.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-6 text-center text-gray-700">
                                Nema aktivnosti.
                            </td>
                        </tr>
                    ) : (
                        aktivnosti.map((a) => (
                            <tr
                                key={a.id}
                                className={`border-t hover:bg-yellow-50/60 ${a.canEdit ? "cursor-pointer" : ""}`}
                                onClick={() => {
                                    if (a.canEdit) onRowClick(a);
                                }}
                            >
                                <td className="p-3 font-semibold">{a.naziv}</td>

                                <td className="p-3">
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-900">
                                        {a.tip}
                                    </span>
                                </td>

                                <td className="p-3 text-gray-800">{a.opis ?? "-"}</td>

                                <td className="p-3">{a.datum ? a.datum.slice(0, 10) : "-"}</td>

                                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={a.uradjen === true}
                                        onChange={(e) => onToggleDone(a.id, e.target.checked)}
                                    />
                                </td>

                                <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                    {a.canDelete ? (
                                        <button
                                            onClick={() => onDelete(a.id)}
                                            className="rounded-lg bg-white px-3 py-1 text-sm font-extrabold text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                                        >
                                            Obriši
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-500">—</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
