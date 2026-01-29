/* ============================================================================
  Shared primitives
============================================================================ */

export type UUID = string;
export type PgNumeric = string;
export type ISODateString = string;
export type WithId = { id: UUID };

/* ============================================================================
  Enums / Unions
============================================================================ */

export type UserRole = "ADMIN" | "PCELAR" | "POLJOPRIVREDNIK";
export type AktivnostTip = string;

/* ============================================================================
  DB Row types
============================================================================ */

export interface AktivnostRow extends WithId {
  naziv: string;
  opis: string | null;
  tip: string | null;
  datum: Date | null;
  uradjen: boolean;
}

export interface DnevnikRow extends WithId {
  datum: Date;
  vreme: string | null;
  slika: string | null;
  kolicina_meda: PgNumeric | null;
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
  uloga: string; // može i UserRole, ali ostavljamo string zbog DB realnosti
  created_at: Date;
}

export interface KosnicaRow extends WithId {
  broj: number;
  tip: string | null;
  datum: Date;
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
  geo_sirina: PgNumeric | null;
  geo_duzina: PgNumeric | null;
  vlasnik_id: UUID;
}

/* ============================================================================
  Domain / View models
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
  DTOs
============================================================================ */

// --- Aktivnosti ---
export type AktivnostCreateDTO = {
  naziv: string;
  opis?: string | null;
  tip?: string | null;
  datum?: ISODateString | null;
  uradjen?: boolean;
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
  datum?: ISODateString;
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
  uloga?: UserRole; // default: PCELAR
};

/**
 * Login payload:
 * - Front trenutno šalje { email, password }
 * - Mi podržimo i { email, sifra } (da ne puca ako negde ostane staro)
 */
export type LoginDTO = {
  email: string;
  password?: string;
  sifra?: string;
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
  Auth shared types (BE + FE)
============================================================================ */

export type AuthUser = {
  id: UUID;
  email: string;
  name: string;
  role: UserRole;
};

export type AuthTokenClaims = {
  sub: UUID;
  email: string;
  name: string;
  role: UserRole;
};

/* ============================================================================
  Relation models
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
  Mappers
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
