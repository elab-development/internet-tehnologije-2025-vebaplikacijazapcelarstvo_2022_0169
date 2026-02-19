"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
  PopupProps,
} from "react-leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
) as unknown as React.ComponentType<MapContainerProps>;

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
) as unknown as React.ComponentType<TileLayerProps>;

const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
) as unknown as React.ComponentType<MarkerProps>;

const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
) as unknown as React.ComponentType<PopupProps>;

type Pcelinjak = {
  id: string;
  naziv: string;
  adresa: string;
  geoSirina: number | null;
  geoDuzina: number | null;
};

export default function PcelinjaciMap() {
  const [items, setItems] = useState<Pcelinjak[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    (async () => {
      try {
        const Lmod = await import("leaflet");
        const L = Lmod.default;

        
        delete (L.Icon.Default.prototype as any)._getIconUrl;

        const markerIcon2x = (await import("leaflet/dist/images/marker-icon-2x.png")).default;
        const markerIcon = (await import("leaflet/dist/images/marker-icon.png")).default;
        const markerShadow = (await import("leaflet/dist/images/marker-shadow.png")).default;

        L.Icon.Default.mergeOptions({
          iconRetinaUrl: markerIcon2x,
          iconUrl: markerIcon,
          shadowUrl: markerShadow,
        });
      } catch {
        
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/pcelinjaci");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const withCoords = useMemo(
    () => items.filter((p) => p.geoSirina != null && p.geoDuzina != null),
    [items]
  );

  const center: [number, number] =
    withCoords.length > 0
      ? [withCoords[0].geoSirina!, withCoords[0].geoDuzina!]
      : [44.7866, 20.4489];

  return (
    <div className="rounded-3xl border border-yellow-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
      <div className="mb-4">
        <h2 className="text-xl font-extrabold tracking-tight text-yellow-900">
          Mapa pčelinjaka
        </h2>
        <p className="mt-1 text-sm text-gray-700">
          Prikaz svih pčelinjaka ulogovanog korisnika na mapi.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-yellow-200/60">
        <div className="h-[420px] w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-600">
              Učitavanje mape…
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={withCoords.length > 0 ? 10 : 7}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {withCoords.map((p) => (
                <Marker key={p.id} position={[p.geoSirina!, p.geoDuzina!]}>
                  <Popup>
                    <div className="space-y-1">
                      <div className="font-semibold">{p.naziv}</div>
                      <div className="text-sm">{p.adresa}</div>
                      <div className="text-xs text-gray-600">
                        {p.geoSirina}, {p.geoDuzina}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {!loading && withCoords.length === 0 && (
        <p className="mt-3 text-sm text-gray-700">
          Trenutno nema pčelinjaka sa unetim geo koordinatama.
        </p>
      )}
    </div>
  );
}
