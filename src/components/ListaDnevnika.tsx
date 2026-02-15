"use client";

import DnevnikCard from "./DnevnikCard";

export type DnevnikItem = {
  id: string;
  datum: string;
  kolicinaMeda?: number | null;
  pregled?: string | null;
  komentar?: string | null;
  kosnicaId: string;
};

export default function ListaDnevnika({
  dnevnici,
  onEdit,
  onDelete,
}: {
  dnevnici: DnevnikItem[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {dnevnici.map((d) => (
        <div key={d.id} className="block">
          <DnevnikCard d={d} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
