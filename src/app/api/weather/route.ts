import { NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;

type Daily = {
  date: string;      
  label: string  
  min: number;
  max: number;
  desc: string;
  icon: string;      
  willRain: boolean;
};

function ymdFromDt(dtSeconds: number) {
  const d = new Date(dtSeconds * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function weekdayLabel(dateYmd: string) {
  const d = new Date(dateYmd + "T12:00:00");
  return d.toLocaleDateString("sr-RS", { weekday: "short" }); // npr "pon"
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address")?.trim();

  if (!API_KEY) {
    return NextResponse.json(
      { city: "", today: null, days: [], error: "Missing OPENWEATHER_API_KEY" },
      { status: 500 }
    );
  }

  if (!address) {
    return NextResponse.json(
      { city: "", today: null, days: [], error: "Missing address" },
      { status: 400 }
    );
  }

  try {
    // 1) Geocoding
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(address)}&limit=1&appid=${API_KEY}`,
      { cache: "no-store" }
    );

    const geoData = await geoRes.json();
    if (!Array.isArray(geoData) || geoData.length === 0) {
      return NextResponse.json(
        { city: "", today: null, days: [], error: "Location not found" },
        { status: 404 }
      );
    }

    const { lat, lon, name } = geoData[0];

    // 2) 5-day / 3h forecast
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
      { cache: "no-store" }
    );

    const weatherData = await weatherRes.json();
    const list: any[] = Array.isArray(weatherData?.list) ? weatherData.list : [];

    if (list.length === 0) {
      return NextResponse.json({ city: name ?? "", today: null, days: [] });
    }

    // "trenutno": prvi point (najbliži sada)
    const nowPoint = list[0];
    const today = {
      dt: Number(nowPoint.dt),
      temp: Number(nowPoint?.main?.temp ?? 0),
      desc: String(nowPoint?.weather?.[0]?.description ?? ""),
      icon: String(nowPoint?.weather?.[0]?.icon ?? ""),
      willRain:
        (Number(nowPoint?.rain?.["3h"] ?? 0) > 0) ||
        (String(nowPoint?.weather?.[0]?.main ?? "").toLowerCase().includes("rain")),
    };

    // Grupisanje po danima
    const byDay = new Map<string, any[]>();
    for (const item of list) {
      const dayKey = ymdFromDt(Number(item.dt));
      if (!byDay.has(dayKey)) byDay.set(dayKey, []);
      byDay.get(dayKey)!.push(item);
    }

    // Sortirani dani (od danas)
    const dayKeys = Array.from(byDay.keys()).sort();

    // Uzimamo: danas + naredna 4 dana = ukupno 5 dana u UI (danas se prikazuje posebno kao "today")
    // Za kartice "naredna 4 dana" uzimamo 4 dana POSLE današnjeg
    const todayKey = ymdFromDt(today.dt);
    const nextKeys = dayKeys.filter((k) => k > todayKey).slice(0, 4);

    const days: Daily[] = nextKeys.map((k) => {
      const items = byDay.get(k)!;

      let min = Infinity;
      let max = -Infinity;
      let willRain = false;

      // biramo “reprezentativan” zapis oko 12:00 ako postoji, inače srednji
      const midday =
        items.find((it) => new Date(Number(it.dt) * 1000).getHours() === 12) ??
        items[Math.floor(items.length / 2)];

      for (const it of items) {
        const tmin = Number(it?.main?.temp_min ?? it?.main?.temp ?? 0);
        const tmax = Number(it?.main?.temp_max ?? it?.main?.temp ?? 0);
        if (tmin < min) min = tmin;
        if (tmax > max) max = tmax;

        const rain3h = Number(it?.rain?.["3h"] ?? 0);
        const main = String(it?.weather?.[0]?.main ?? "").toLowerCase();
        if (rain3h > 0 || main.includes("rain") || main.includes("drizzle") || main.includes("thunderstorm")) {
          willRain = true;
        }
      }

      return {
        date: k,
        label: weekdayLabel(k),
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        desc: String(midday?.weather?.[0]?.description ?? ""),
        icon: String(midday?.weather?.[0]?.icon ?? ""),
        willRain,
      };
    });

    return NextResponse.json({
      city: name ?? "",
      today,
      days,
    });
  } catch {
    return NextResponse.json(
      { city: "", today: null, days: [], error: "Weather error" },
      { status: 500 }
    );
  }
}
