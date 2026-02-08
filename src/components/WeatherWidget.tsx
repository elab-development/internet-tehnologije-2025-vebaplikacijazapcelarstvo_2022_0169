"use client";

import { useEffect, useState } from "react";

type Today = {
  dt: number;
  temp: number;
  desc: string;
  icon: string;
  willRain: boolean;
};

type Day = {
  date: string;
  label: string; // pon/uto...
  min: number;
  max: number;
  desc: string;
  icon: string;
  willRain: boolean;
};

type WeatherResponse = {
  city: string;
  today: Today | null;
  days: Day[];
};

function fmtTime(dtSeconds: number) {
  const d = new Date(dtSeconds * 1000);
  return d.toLocaleString("sr-RS", { hour: "2-digit", minute: "2-digit" });
}

function iconUrl(icon: string) {
  // 2x ikonica
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export default function WeatherWidget({ address }: { address: string | null }) {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/weather?address=${encodeURIComponent(address)}`, {
          method: "GET",
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out?.error || "Weather error");
        if (!cancelled) setData(out);
      } catch (e) {
        console.error(e);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  const today = data?.today ?? null;
  const days = Array.isArray(data?.days) ? data!.days : [];

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-sky-200/40 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 p-6 text-white shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold">Vremenska prognoza</h2>
          <p className="text-sm opacity-85">{data?.city || "Izaberi pčelinjak"}</p>
        </div>

        <div className="text-xs opacity-85">
          {today?.willRain ? "🌧️ moguć pljusak" : "☀️ bez padavina"}
        </div>
      </div>

      {!address ? (
        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm opacity-90">
          Izaberi pčelinjak da bi se prikazala prognoza.
        </div>
      ) : loading ? (
        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm opacity-90">Učitavanje...</div>
      ) : !data || !today ? (
        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm opacity-90">
          Prognoza nije dostupna.
        </div>
      ) : (
        <>
          {/* DANAS */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div>
              <div className="text-sm font-semibold opacity-90">Danas (sada • {fmtTime(today.dt)})</div>
              <div className="mt-1 text-4xl font-extrabold">{Math.round(today.temp)}°C</div>
              <div className="mt-1 text-sm capitalize opacity-90">{today.desc}</div>
            </div>

            <div className="flex items-center gap-3">
              {today.icon ? (
                <img
                  src={iconUrl(today.icon)}
                  alt={today.desc}
                  className="h-14 w-14 drop-shadow"
                />
              ) : null}
            </div>
          </div>

          {/* NAREDNA 4 DANA */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {days.slice(0, 4).map((d) => (
              <div key={d.date} className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur">
                <div className="text-xs font-semibold uppercase opacity-90">{d.label}</div>

                <div className="mx-auto mt-2 flex w-full items-center justify-center">
                  {d.icon ? (
                    <img
                      src={iconUrl(d.icon)}
                      alt={d.desc}
                      className="h-12 w-12 drop-shadow"
                    />
                  ) : null}
                </div>

                <div className="mt-1 text-sm capitalize opacity-90">{d.desc}</div>

                <div className="mt-2 text-sm font-bold">
                  {Math.round(d.max)}° / <span className="opacity-80">{Math.round(d.min)}°</span>
                </div>

                <div className="mt-1 text-xs opacity-85">
                  {d.willRain ? "🌧️ padavine" : "☀️ suvo"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
