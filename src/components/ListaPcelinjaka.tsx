"use client";

import Link from "next/link";
import PcelinjakCard from "./PcelinjakCard";

export type PcelinjakItem = {
    id: string;
    naziv: string;
    geoSirina: number | null;
    geoDuzina: number | null;
    adresa: string | null;
};

export default function ListaPcelinjaka({
    pcelinjaci,
    onEdit,
    onDelete,
}: {
    pcelinjaci: PcelinjakItem[];
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}) {
    return (
        <div className="space-y-6">
            {pcelinjaci.map((p) => (
                <Link key={p.id} href={`/pcelinjaci/${p.id}`} className="block">
                    <PcelinjakCard p={p} onEdit={onEdit} onDelete={onDelete} />
                </Link>
            ))}
        </div>
    );
}
