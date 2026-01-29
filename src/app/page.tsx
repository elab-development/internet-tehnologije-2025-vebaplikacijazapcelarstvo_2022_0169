import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative isolate">
        <div className="relative h-[85vh] w-full overflow-hidden">
          <Image
            src="/pozadina.png"
            alt="Pčelinjak"
            fill
            priority
            className="object-cover pointer-events-none"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/15 via-orange-400/10 to-amber-400/15 pointer-events-none" />

          <div className="absolute -top-24 left-[-80px] h-80 w-80 rounded-full bg-yellow-300/30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-orange-400/25 blur-3xl pointer-events-none" />


          <div className="absolute inset-0 z-10 flex items-center">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-10 md:grid-cols-2 md:px-6">

              {/* LEVA STRANA */}
              <div className="flex flex-col justify-center text-white mt-10 md:mt-14">

                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                  <span>🐝</span>
                  <span>Veb Pčelarstvo</span>
                </div>

                <h1 className="mt-5 text-4xl font-extrabold leading-tight drop-shadow md:text-5xl">
                  Organizuj pčelinjak, aktivnosti i dnevnik — lako i pregledno.
                </h1>

                <p className="mt-4 max-w-xl text-sm md:text-base text-white/90 leading-relaxed">
                  Evidentiraj košnice, planiraj aktivnosti i vodi dnevnik pregleda
                  brzo, jasno i na jednom mestu.
                </p>

                {/* Dugmad */}
                <div className="relative z-30 mt-8 flex flex-wrap items-center gap-5">
                  <Link
                    href="/registracija"
                    className="rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-400 px-8 py-3 text-base font-semibold text-black shadow-xl transition hover:scale-105"
                  >
                    Registruj se
                  </Link>

                  <Link
                    href="/prijava"
                    className="rounded-2xl border-2 border-white px-8 py-3 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-black hover:scale-105"
                  >
                    Prijavi se
                  </Link>
                </div>

              </div>

              {/* DESNA KARTICA */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white/90 shadow">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        Funkcionalnosti sistema
                      </div>
                      <div className="text-sm text-white/80">
                        Pristup zavisi od korisničke uloge.
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <div className="font-semibold">🐝 Pčelar</div>
                      <div className="text-sm text-white/85">
                        Upravljanje pčelinjacima, košnicama i dnevnikom pregleda.
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <div className="font-semibold">🌾 Poljoprivrednik</div>
                      <div className="text-sm text-white/85">
                        Pregled i realizacija aktivnosti.
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <div className="font-semibold">⚙️ Administrator</div>
                      <div className="text-sm text-white/85">
                        Upravljanje korisnicima i sistemskim aktivnostima.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-50/70 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* OPIS SISTEMA */}
      <section className="bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 py-20">
        <div className="mx-auto max-w-5xl px-6">

          {/* Naslov */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-orange-900 leading-snug">
            Veb Pčelarstvo predstavlja savremeni informacioni sistem
            za upravljanje pčelinjacima i košnicama.
          </h2>

          {/* Dekorativna linija */}
          <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />

          {/* Prvi pasus */}
          <p className="mt-6 text-base md:text-lg text-orange-900/80 leading-relaxed">
            Sistem omogućava <span className="font-semibold text-orange-900">
              sistematsko evidentiranje podataka</span> o pčelinjacima i košnicama,
            planiranje i praćenje aktivnosti, kao i detaljno beleženje pregleda
            kroz dnevnik rada.
          </p>

          {/* Drugi pasus */}
          <p className="mt-4 text-base md:text-lg text-orange-900/80 leading-relaxed">
            U zavisnosti od korisničke uloge (<span className="font-semibold">
              pčelar, poljoprivrednik ili administrator</span>), aplikacija
            obezbeđuje pristup odgovarajućim funkcionalnostima i jasno definisanim
            ovlašćenjima.
          </p>

          {/* Treći pasus */}
          <p className="mt-4 text-base md:text-lg text-orange-900/80 leading-relaxed">
            Cilj sistema je unapređenje organizacije rada, smanjenje
            administrativnih grešaka i omogućavanje jednostavnog,
            preglednog i pouzdanog pristupa podacima u svakom trenutku.
          </p>

        </div>
      </section>

    </main>
  );
}
