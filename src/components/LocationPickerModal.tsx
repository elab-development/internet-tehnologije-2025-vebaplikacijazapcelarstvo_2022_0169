"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMapEvents } from "react-leaflet";

import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
  PopupProps,
  CircleProps,
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

const Circle = dynamic(
  () => import("react-leaflet").then((m) => m.Circle),
  { ssr: false }
) as unknown as React.ComponentType<CircleProps>;


function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}


type NominatimItem = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function LocationPickerModal({
  open,
  onClose,
  initial,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  initial?: { lat: number; lng: number; address?: string } | null;
  onPick: (v: { lat: number; lng: number; address?: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NominatimItem[]>([]);
  const [marker, setMarker] = useState<[number, number] | null>(
    initial ? [initial.lat, initial.lng] : null
  );
  const [center, setCenter] = useState<[number, number]>(
    initial ? [initial.lat, initial.lng] : [44.7866, 20.4489]
  );

  
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setMarker([initial.lat, initial.lng]);
      setCenter([initial.lat, initial.lng]);
    } else {
      setMarker(null);
      setCenter([44.7866, 20.4489]);
    }
    setQuery("");
    setResults([]);
  }, [open, initial]);

  
  useEffect(() => {
    if (!open) return;

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
      } catch {}
    })();
  }, [open]);

  const markerObj = useMemo(
    () => (marker ? { lat: marker[0], lng: marker[1] } : null),
    [marker]
  );

  async function search() {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=json&limit=6&q=" +
        encodeURIComponent(query);

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const data = (await res.json()) as NominatimItem[];
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  function pick(lat: number, lng: number, address?: string) {
    setMarker([lat, lng]);
    setCenter([lat, lng]);
    onPick({ lat, lng, address });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl">
        
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-lg font-extrabold text-yellow-900">
              Izbor lokacije na mapi
            </h3>
            <p className="text-sm text-gray-600">
              Pretraži po nazivu ili klikni na mapu da izabereš lokaciju.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm font-bold hover:bg-gray-100"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-[360px_1fr]">
          
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">
                Pretraga lokacije
              </label>
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      search();
                    }
                  }}
                  className="w-full rounded-xl border border-yellow-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-orange-200"
                  placeholder="npr. Trebinje, Fruška gora..."
                />
                <button
                  type="button"
                  onClick={search}
                  className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-extrabold text-white"
                >
                  {loading ? "..." : "Traži"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-3">
              <div className="text-sm font-extrabold text-yellow-900">Rezultati</div>
              {results.length === 0 ? (
                <p className="mt-2 text-sm text-gray-700">
                  {loading ? "Učitavanje..." : "Nema rezultata"}
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {results.map((r, i) => {
                    const lat = Number(r.lat);
                    const lng = Number(r.lon);
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => pick(lat, lng, r.display_name)}
                          className="w-full rounded-xl bg-white px-3 py-2 text-left text-sm ring-1 ring-yellow-200 hover:bg-yellow-100"
                        >
                          <div className="font-bold line-clamp-2">
                            {r.display_name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {lat.toFixed(5)}, {lng.toFixed(5)}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-3 text-sm">
              <div className="font-bold">Izabrano</div>
              {markerObj ? (
                <div>
                  {markerObj.lat.toFixed(6)}, {markerObj.lng.toFixed(6)}
                </div>
              ) : (
                <div>Nije izabrano</div>
              )}
            </div>
          </div>

          
          <div className="overflow-hidden rounded-2xl border border-yellow-200/60">
            <div className="h-[460px] w-full">
              <MapContainer
                center={center}
                zoom={marker ? 12 : 7}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ClickHandler onPick={(lat, lng) => pick(lat, lng)} />

                {marker && (
                  <>
                    <Marker position={marker}>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-bold">Izabrana lokacija</div>
                          <div className="text-xs">
                            {marker[0].toFixed(6)}, {marker[1].toFixed(6)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Napredni layer: krug od 3km */}
                    <Circle center={marker} radius={3000} />
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold ring-1 ring-gray-200"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}
