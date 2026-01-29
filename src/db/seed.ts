import { db } from "./index";
import { korisnici, pcelinjaci, kosnice, dnevnici, aktivnosti, notifikacije, izvestaji } from "./schema";
import bcrypt from "bcrypt";

const KORISNIK_IDS = {
    ADMIN: "00000000-0000-0000-0000-000000000001",
    PCELAR: "00000000-0000-0000-0000-000000000002",
    POLJOPRIVREDNIK: "00000000-0000-0000-0000-000000000003",
} as const;

const PCELINJAK_IDS = {
    FRUSKA_GORA: "00000000-0000-0000-0000-000000000101",
    AVALA: "00000000-0000-0000-0000-000000000102",
} as const;

const KOSNICA_IDS = {
    K1: "00000000-0000-0000-0000-000000000201",
    K2: "00000000-0000-0000-0000-000000000202",
    K3: "00000000-0000-0000-0000-000000000203",
} as const;

const AKTIVNOST_IDS = {
    PCELAR_AKT: "00000000-0000-0000-0000-000000000301",
    POLJO_AKT: "00000000-0000-0000-0000-000000000302",
} as const;

async function main() {
    const hash = await bcrypt.hash("1234", 10);

    await db.transaction(async (tx) => {

        await tx.insert(korisnici).values([
            {
                id: KORISNIK_IDS.ADMIN,
                ime: "admin",
                prezime: "admin",
                email: "admin@test.com",
                sifra: hash,
                uloga: "administrator",
            },
            {
                id: KORISNIK_IDS.PCELAR,
                ime: "Pcelar",
                prezime: "Pcelar",
                email: "pcelar@test.com",
                sifra: hash,
                uloga: "pcelar",
            },
            {
                id: KORISNIK_IDS.POLJOPRIVREDNIK,
                ime: "Poljoprivrednik",
                prezime: "Poljoprivrednik",
                email: "poljo@test.com",
                sifra: hash,
                uloga: "poljoprivrednik",
            }
        ]).onConflictDoNothing();

        await tx.insert(pcelinjaci).values([
            {
                id: PCELINJAK_IDS.FRUSKA_GORA,
                naziv: "Pčelinjak Fruška Gora",
                adresa: "Fruška Gora bb",
                geoSirina: "45.12345678",
                geoDuzina: "19.12345678",
                vlasnikId: KORISNIK_IDS.PCELAR,
            },
            {
                id: PCELINJAK_IDS.AVALA,
                naziv: "Pčelinjak Avala",
                adresa: "Avala bb",
                geoSirina: "44.65432100",
                geoDuzina: "20.12345600",
                vlasnikId: KORISNIK_IDS.PCELAR,
            }
        ]).onConflictDoNothing();

        await tx.insert(kosnice).values([
            {
                id: KOSNICA_IDS.K1,
                broj: 1,
                tip: "LR",
                starostMatice: 1,
                brNastavaka: 2,
                pcelinjakId: PCELINJAK_IDS.FRUSKA_GORA,
            },
            {
                id: KOSNICA_IDS.K2,
                broj: 2,
                tip: "DB",
                starostMatice: 2,
                brNastavaka: 3,
                pcelinjakId: PCELINJAK_IDS.FRUSKA_GORA,
            },
            {
                id: KOSNICA_IDS.K3,
                broj: 3,
                tip: "LR",
                starostMatice: 1,
                brNastavaka: 2,
                pcelinjakId: PCELINJAK_IDS.AVALA,
            }
        ]).onConflictDoNothing();

        await tx.insert(dnevnici).values([
            {
                id: "00000000-0000-0000-0000-000000000401",
                kosnicaId: KOSNICA_IDS.K1,
                vreme: "10:00",
                kolicinaMeda: "12.50",
                pregled: "Zdravo društvo",
                komentar: "Dodate satne osnove",
            },
            {
                id: "00000000-0000-0000-0000-000000000402",
                kosnicaId: KOSNICA_IDS.K2,
                vreme: "12:30",
                kolicinaMeda: "8.20",
                pregled: "Mirno društvo",
                komentar: "Bez znakova bolesti",
            }
        ]).onConflictDoNothing();

        await tx.insert(izvestaji).values([
            {
                id: "00000000-0000-0000-0000-000000000501",
                datumOd: new Date("2026-01-01"),
                datumDo: new Date("2026-01-07"),
                korisnikId: KORISNIK_IDS.PCELAR,
                pcelinjakId: PCELINJAK_IDS.FRUSKA_GORA,
            }
        ]).onConflictDoNothing();

        await tx.insert(aktivnosti).values([
            {
                id: AKTIVNOST_IDS.PCELAR_AKT,
                naziv: "Pregled košnica",
                opis: "Redovan prolećni pregled",
                tip: "pregled",
                datum: new Date(),
            },
            {
                id: AKTIVNOST_IDS.POLJO_AKT,
                naziv: "Priprema zemljišta",
                opis: "Oranje i đubrenje parcele",
                tip: "poljoprivreda",
                datum: new Date(),
            }
        ]).onConflictDoNothing();

        await tx.insert(notifikacije).values([
            {
                id: "00000000-0000-0000-0000-000000000601",
                korisnikId: KORISNIK_IDS.PCELAR,
                aktivnostId: AKTIVNOST_IDS.PCELAR_AKT,
            },
            {
                id: "00000000-0000-0000-0000-000000000602",
                korisnikId: KORISNIK_IDS.POLJOPRIVREDNIK,
                aktivnostId: AKTIVNOST_IDS.POLJO_AKT,
            }
        ]).onConflictDoNothing();
    });

}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
