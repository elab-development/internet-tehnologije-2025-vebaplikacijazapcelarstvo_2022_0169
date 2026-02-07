import { db } from "./index";
import {
    korisnici,
    pcelinjaci,
    kosnice,
    dnevnici,
    aktivnosti,
    korisnikAktivnosti,
    izvestaji,
} from "./schema";
import bcrypt from "bcrypt";

/* ============================================================================
  KONSTANTNI ID-jevi
============================================================================ */

const KORISNIK_IDS = {
    ADMIN: "00000000-0000-0000-0000-000000000001",
    PCELAR: "00000000-0000-0000-0000-000000000002",
    POLJOPRIVREDNIK: "00000000-0000-0000-0000-000000000003",
} as const;

const PCELINJAK_IDS = {
    FRUSKA_GORA: "00000000-0000-0000-0000-000000000101",
} as const;

const KOSNICA_IDS = {
    K1: "00000000-0000-0000-0000-000000000201",
} as const;

const AKTIVNOST_IDS = {
    SEZONSKA: "00000000-0000-0000-0000-000000000301",
    POLJOPRIVREDNIK: "00000000-0000-0000-0000-000000000302",
    PCELAR: "00000000-0000-0000-0000-000000000303",
} as const;

/* ============================================================================
  SEED
============================================================================ */

async function main() {
    const hash = await bcrypt.hash("1234", 10);

    await db.transaction(async (tx) => {
        /* -------------------- KORISNICI -------------------- */
        await tx
            .insert(korisnici)
            .values([
                {
                    id: KORISNIK_IDS.ADMIN,
                    ime: "Admin",
                    prezime: "Admin",
                    email: "admin@test.com",
                    sifra: hash,
                    uloga: "administrator",
                },
                {
                    id: KORISNIK_IDS.PCELAR,
                    ime: "Pčelar",
                    prezime: "Test",
                    email: "pcelar@test.com",
                    sifra: hash,
                    uloga: "pcelar",
                },
                {
                    id: KORISNIK_IDS.POLJOPRIVREDNIK,
                    ime: "Poljoprivrednik",
                    prezime: "Test",
                    email: "poljo@test.com",
                    sifra: hash,
                    uloga: "poljoprivrednik",
                },
            ])
            .onConflictDoNothing();

        /* -------------------- PCELINJAK -------------------- */
        await tx
            .insert(pcelinjaci)
            .values({
                id: PCELINJAK_IDS.FRUSKA_GORA,
                naziv: "Pčelinjak Fruška Gora",
                adresa: "Fruška Gora bb",
                vlasnikId: KORISNIK_IDS.PCELAR,
            })
            .onConflictDoNothing();

        /* -------------------- KOŠNICA -------------------- */
        await tx
            .insert(kosnice)
            .values({
                id: KOSNICA_IDS.K1,
                broj: 1,
                tip: "LR",
                pcelinjakId: PCELINJAK_IDS.FRUSKA_GORA,
            })
            .onConflictDoNothing();

        /* -------------------- DNEVNIK -------------------- */
        await tx
            .insert(dnevnici)
            .values({
                id: "00000000-0000-0000-0000-000000000401",
                kosnicaId: KOSNICA_IDS.K1,
                vreme: "10:00",
                kolicinaMeda: "12.50",
                pregled: "Zdravo društvo",
                komentar: "Dodate satne osnove",
            })
            .onConflictDoNothing();

        /* -------------------- IZVEŠTAJ -------------------- */
        await tx
            .insert(izvestaji)
            .values({
                id: "00000000-0000-0000-0000-000000000501",
                datumOd: new Date("2026-03-01"),
                datumDo: new Date("2026-03-31"),
                korisnikId: KORISNIK_IDS.PCELAR,
                pcelinjakId: PCELINJAK_IDS.FRUSKA_GORA,
            })
            .onConflictDoNothing();

        /* -------------------- AKTIVNOSTI -------------------- */
        await tx
            .insert(aktivnosti)
            .values([
                // SEZONSKA (sistemska, creatorId = null)
                {
                    id: AKTIVNOST_IDS.SEZONSKA,
                    naziv: "Prolećni pregled košnica",
                    opis: "Sezonska aktivnost – pregled stanja društava",
                    tip: "SEZONSKA",
                    datum: new Date("2026-03-20"),
                    creatorId: null,
                },

                // POLJOPRIVREDNIK (vidljivo pčelarima)
                {
                    id: AKTIVNOST_IDS.POLJOPRIVREDNIK,
                    naziv: "Upozorenje: prskanje useva",
                    opis: "Poljoprivrednik planira prskanje – zatvoriti leta",
                    tip: "POLJOPRIVREDNIK",
                    datum: new Date("2026-03-18"),
                    creatorId: KORISNIK_IDS.POLJOPRIVREDNIK,
                },

                // PCELAR (privatna aktivnost)
                {
                    id: AKTIVNOST_IDS.PCELAR,
                    naziv: "Dodavanje medišta",
                    opis: "Privatna aktivnost pčelara",
                    tip: "PCELAR",
                    datum: new Date("2026-03-22"),
                    creatorId: KORISNIK_IDS.PCELAR,
                },
            ])
            .onConflictDoNothing();

        /* -------------------- STATUSI (korisnik_aktivnosti) -------------------- */
        await tx
            .insert(korisnikAktivnosti)
            .values([
                {
                    korisnikId: KORISNIK_IDS.PCELAR,
                    aktivnostId: AKTIVNOST_IDS.SEZONSKA,
                    uradjen: false,
                },
                {
                    korisnikId: KORISNIK_IDS.PCELAR,
                    aktivnostId: AKTIVNOST_IDS.POLJOPRIVREDNIK,
                    uradjen: false,
                },
                {
                    korisnikId: KORISNIK_IDS.PCELAR,
                    aktivnostId: AKTIVNOST_IDS.PCELAR,
                    uradjen: true,
                    uradjenAt: new Date("2026-03-15"),
                },
            ])
            .onConflictDoNothing();
    });

    console.log("✅ Novi seed uspešno završen");
}

main().catch((err) => {
    console.error("❌ Seed greška:", err);
    process.exit(1);
});
