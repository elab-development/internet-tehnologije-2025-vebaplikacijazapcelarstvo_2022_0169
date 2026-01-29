/* ============================================================================
  Shared primitives
============================================================================ */

export type UUID = string;

/**
 * Postgres `numeric` često dolazi kao string (zavisno od drivera/drizzle config).
 * Ako si sigurna da uvek mapiraš u number, promeni u `number`.
 */
export type PgNumeric = string;

/** ISO string format koji često koristiš u API-ju (umesto Date objekta). */
export type ISODateString = string;

/** Helper: polja koja DB defaultuje (id, created_at, datum...) */
export type WithId = { id: UUID };

/* ============================================================================
  Enums / Unions
============================================================================ */

/** Ako u bazi nema enum, ali želiš kontrolu u FE/BE, drži union. */
export type UserRole = "ADMIN" | "PCELAR" | "KORISNIK";

/** Aktivnost tip (ako želiš strože – dopuni stvarnim vrednostima) */
export type AktivnostTip = string;

/* ============================================================================
  DB Row types (kako izgleda red iz baze)
  - koristi Date za timestamp
  - koristi PgNumeric za numeric
============================================================================ */

export interface AktivnostRow extends WithId {
  naziv: string;
  opis: string | null;
  tip: string | null;
  datum: Date | null;
  uradjen: boolean;
}

export interface DnevnikRow extends WithId {
  datum: Date; // default now()
  vreme: string | null;
  slika: string | null;
  kolicina_meda: PgNumeric | null; // numeric(10,2)
  pregled: string | null;
  komentar: string | null;
  kosnica_id: UUID;
}

export interface IzvestajRow extends WithId {
  datum_od: Date;
  datum_do: Date;
  korisnik_id: UUID;
  pcelinjak_id: UUID;
}

export interface KorisnikRow extends WithId {
  ime: string;
  prezime: string;
  email: string;
  sifra: string;
  uloga: string; // ili UserRole (vidi napomenu ispod)
  created_at: Date;
}

export interface KosnicaRow extends WithId {
  broj: number;
  tip: string | null;
  datum: Date; // default now()
  starost_matice: number | null;
  br_nastavaka: number | null;
  pcelinjak_id: UUID;
}

export interface NotifikacijaRow extends WithId {
  korisnik_id: UUID;
  aktivnost_id: UUID;
}

export interface PcelinjakRow extends WithId {
  naziv: string;
  adresa: string | null;
  geo_sirina: PgNumeric | null; // numeric(10,8)
  geo_duzina: PgNumeric | null; // numeric(11,8)
  vlasnik_id: UUID;
}

/* ============================================================================
  Domain / View models (za FE i biznis logiku)
  - ovde je zgodno da numeric bude number
  - i timestamp u ISO string (lakše kroz API)
============================================================================ */

export interface Aktivnost {
  id: UUID;
  naziv: string;
  opis?: string | null;
  tip?: AktivnostTip | null;
  datum?: ISODateString | null;
  uradjen: boolean;
}

export interface Dnevnik {
  id: UUID;
  datum: ISODateString;
  vreme?: string | null;
  slika?: string | null;
  kolicinaMeda?: number | null;
  pregled?: string | null;
  komentar?: string | null;
  kosnicaId: UUID;
}

export interface Izvestaj {
  id: UUID;
  datumOd: ISODateString;
  datumDo: ISODateString;
  korisnikId: UUID;
  pcelinjakId: UUID;
}

export interface KorisnikPublic {
  id: UUID;
  ime: string;
  prezime: string;
  email: string;
  uloga: UserRole | string;
  createdAt: ISODateString;
}

/** Nikad ne šalji sifru na FE */
export interface KorisnikPrivate extends KorisnikPublic {
  sifra: string;
}

export interface Kosnica {
  id: UUID;
  broj: number;
  tip?: string | null;
  datum: ISODateString;
  starostMatice?: number | null;
  brNastavaka?: number | null;
  pcelinjakId: UUID;
}

export interface Notifikacija {
  id: UUID;
  korisnikId: UUID;
  aktivnostId: UUID;
}

export interface Pcelinjak {
  id: UUID;
  naziv: string;
  adresa?: string | null;
  geoSirina?: number | null;
  geoDuzina?: number | null;
  vlasnikId: UUID;
}

/* ============================================================================
  DTOs (za API: create/update/payload)
  - Create: obavezna polja bez id/default
  - Update: partial (obično PATCH)
============================================================================ */

// --- Aktivnosti ---
export type AktivnostCreateDTO = {
  naziv: string;
  opis?: string | null;
  tip?: string | null;
  datum?: ISODateString | null;
  uradjen?: boolean; // default false
};

export type AktivnostUpdateDTO = Partial<Omit<AktivnostCreateDTO, "naziv">> & {
  naziv?: string;
};

// --- Dnevnici ---
export type DnevnikCreateDTO = {
  kosnicaId: UUID;
  vreme?: string | null;
  slika?: string | null;
  kolicinaMeda?: number | null;
  pregled?: string | null;
  komentar?: string | null;
  datum?: ISODateString; // ako ne pošalješ, DB default
};

export type DnevnikUpdateDTO = Partial<Omit<DnevnikCreateDTO, "kosnicaId">> & {
  kosnicaId?: UUID;
};

// --- Izvestaji ---
export type IzvestajCreateDTO = {
  datumOd: ISODateString;
  datumDo: ISODateString;
  korisnikId: UUID;
  pcelinjakId: UUID;
};

export type IzvestajUpdateDTO = Partial<IzvestajCreateDTO>;

// --- Korisnici (Auth) ---
export type RegisterDTO = {
  ime: string;
  prezime: string;
  email: string;
  sifra: string;
  uloga?: UserRole; // default npr KORISNIK
};

export type LoginDTO = {
  email: string;
  sifra: string;
};

// --- Kosnice ---
export type KosnicaCreateDTO = {
  broj: number;
  pcelinjakId: UUID;
  tip?: string | null;
  starostMatice?: number | null;
  brNastavaka?: number | null;
  datum?: ISODateString;
};

export type KosnicaUpdateDTO = Partial<Omit<KosnicaCreateDTO, "pcelinjakId">> & {
  pcelinjakId?: UUID;
};

// --- Pcelinjaci ---
export type PcelinjakCreateDTO = {
  naziv: string;
  vlasnikId: UUID;
  adresa?: string | null;
  geoSirina?: number | null;
  geoDuzina?: number | null;
};

export type PcelinjakUpdateDTO = Partial<Omit<PcelinjakCreateDTO, "vlasnikId">> & {
  vlasnikId?: UUID;
};

// --- Notifikacije ---
export type NotifikacijaCreateDTO = {
  korisnikId: UUID;
  aktivnostId: UUID;
};

export type NotifikacijaUpdateDTO = Partial<NotifikacijaCreateDTO>;

/* ============================================================================
  Relation models (kad radiš join/select sa relacijama)
============================================================================ */

export type PcelinjakWithKosnice = Pcelinjak & {
  kosnice: Kosnica[];
};

export type KosnicaWithDnevnici = Kosnica & {
  dnevnici: Dnevnik[];
};

export type KorisnikWithPcelinjaci = KorisnikPublic & {
  pcelinjaci: Pcelinjak[];
};

/* ============================================================================
  Mappers (DB Row -> Domain)
  (koristi ih u API rutama da uvek vraćaš isti format)
============================================================================ */

export const mapAktivnostRow = (r: AktivnostRow): Aktivnost => ({
  id: r.id,
  naziv: r.naziv,
  opis: r.opis,
  tip: r.tip,
  datum: r.datum ? r.datum.toISOString() : null,
  uradjen: r.uradjen,
});

export const mapDnevnikRow = (r: DnevnikRow): Dnevnik => ({
  id: r.id,
  datum: r.datum.toISOString(),
  vreme: r.vreme,
  slika: r.slika,
  kolicinaMeda: r.kolicina_meda !== null ? Number(r.kolicina_meda) : null,
  pregled: r.pregled,
  komentar: r.komentar,
  kosnicaId: r.kosnica_id,
});

export const mapKosnicaRow = (r: KosnicaRow): Kosnica => ({
  id: r.id,
  broj: r.broj,
  tip: r.tip,
  datum: r.datum.toISOString(),
  starostMatice: r.starost_matice,
  brNastavaka: r.br_nastavaka,
  pcelinjakId: r.pcelinjak_id,
});

export const mapPcelinjakRow = (r: PcelinjakRow): Pcelinjak => ({
  id: r.id,
  naziv: r.naziv,
  adresa: r.adresa,
  geoSirina: r.geo_sirina !== null ? Number(r.geo_sirina) : null,
  geoDuzina: r.geo_duzina !== null ? Number(r.geo_duzina) : null,
  vlasnikId: r.vlasnik_id,
});

export const mapKorisnikRowPublic = (r: KorisnikRow): KorisnikPublic => ({
  id: r.id,
  ime: r.ime,
  prezime: r.prezime,
  email: r.email,
  uloga: r.uloga as UserRole,
  createdAt: r.created_at.toISOString(),
});
