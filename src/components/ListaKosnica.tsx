"use client";

import KosnicaCard from "./KosnicaCard";
import type { Kosnica } from "@/shared/types";

export default function ListaKosnica({
  kosnice,
  onEdit,
  onDelete,
}: {
  kosnice: Kosnica[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {kosnice.map((k) => (
        <KosnicaCard key={k.id} k={k} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
