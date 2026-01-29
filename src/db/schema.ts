import { pgTable, uuid, varchar, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const ulogeKorisnika = ["administrator", "pcelar", "poljoprivrednik"] as const;


export const korisnici = pgTable("korisnici", {
    id: uuid("id").primaryKey().defaultRandom(),

    ime: varchar("ime", { length: 100 }).notNull(),
    prezime: varchar("prezime", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    sifra: varchar("sifra", { length: 255 }).notNull(),
    uloga: varchar("uloga", { length: 50 }).notNull(),

    createdAt: timestamp("created_at").defaultNow(),
});


export const pcelinjaci = pgTable("pcelinjaci", {
    id: uuid("id").primaryKey().defaultRandom(),

    naziv: varchar("naziv", { length: 255 }).notNull(),
    adresa: varchar("adresa", { length: 255 }),
    geoSirina: decimal("geo_sirina", { precision: 10, scale: 8 }),
    geoDuzina: decimal("geo_duzina", { precision: 11, scale: 8 }),
    vlasnikId: uuid("vlasnik_id")
        .notNull()
        .references(() => korisnici.id, { onDelete: "cascade" }),

});


export const izvestaji = pgTable("izvestaji", {
    id: uuid("id").primaryKey().defaultRandom(),

    datumOd: timestamp("datum_od").notNull(),
    datumDo: timestamp("datum_do").notNull(),

    korisnikId: uuid("korisnik_id")
        .notNull()
        .references(() => korisnici.id, { onDelete: "cascade" }),

    pcelinjakId: uuid("pcelinjak_id")
        .notNull()
        .references(() => pcelinjaci.id, { onDelete: "cascade" }),
});


export const kosnice = pgTable("kosnice", {
    id: uuid("id").primaryKey().defaultRandom(),

    broj: integer("broj").notNull(),
    tip: varchar("tip", { length: 100 }),
    datum: timestamp("datum").defaultNow(),
    starostMatice: integer("starost_matice"),
    brNastavaka: integer("br_nastavaka"),

    pcelinjakId: uuid("pcelinjak_id")
        .notNull()
        .references(() => pcelinjaci.id, { onDelete: "cascade" }),
});


export const dnevnici = pgTable("dnevnici", {
    id: uuid("id").primaryKey().defaultRandom(),

    datum: timestamp("datum").defaultNow(),
    vreme: varchar("vreme", { length: 50 }),
    slika: varchar("slika", { length: 512 }),
    kolicinaMeda: decimal("kolicina_meda", { precision: 10, scale: 2 }),
    pregled: varchar("pregled", { length: 512 }),
    komentar: varchar("komentar", { length: 512 }),

    kosnicaId: uuid("kosnica_id")
        .notNull()
        .references(() => kosnice.id, { onDelete: "cascade" }),
});


export const aktivnosti = pgTable("aktivnosti", {
    id: uuid("id").primaryKey().defaultRandom(),

    naziv: varchar("naziv", { length: 255 }).notNull(),
    opis: varchar("opis", { length: 512 }),
    tip: varchar("tip", { length: 100 }),
    datum: timestamp("datum"),
    uradjen: boolean("uradjen").default(false),
});

export const notifikacije = pgTable("notifikacije", {
    id: uuid("id").primaryKey().defaultRandom(),

    korisnikId: uuid("korisnik_id")
        .notNull()
        .references(() => korisnici.id, { onDelete: "cascade" }),

    aktivnostId: uuid("aktivnost_id")
        .notNull()
        .references(() => aktivnosti.id, { onDelete: "cascade" }),
});



export const korisniciRelacije = relations(korisnici, ({ many }) => ({
    izvestaji: many(izvestaji),
    notifikacije: many(notifikacije),
}));

export const pcelinjaciRelacije = relations(pcelinjaci, ({ many }) => ({
    kosnice: many(kosnice),
    izvestaji: many(izvestaji),
}));

export const kosniceRelacije = relations(kosnice, ({ one, many }) => ({
    pcelinjak: one(pcelinjaci, {
        fields: [kosnice.pcelinjakId],
        references: [pcelinjaci.id],
    }),
    dnevnici: many(dnevnici),
}));

export const dnevniciRelacije = relations(dnevnici, ({ one }) => ({
    kosnica: one(kosnice, {
        fields: [dnevnici.kosnicaId],
        references: [kosnice.id],
    }),
}));

export const izvestajiRelacije = relations(izvestaji, ({ one }) => ({
    korisnik: one(korisnici, {
        fields: [izvestaji.korisnikId],
        references: [korisnici.id],
    }),
    pcelinjak: one(pcelinjaci, {
        fields: [izvestaji.pcelinjakId],
        references: [pcelinjaci.id],
    }),
}));

export const notifikacijeRelacije = relations(notifikacije, ({ one }) => ({
    korisnik: one(korisnici, {
        fields: [notifikacije.korisnikId],
        references: [korisnici.id],
    }),
    aktivnost: one(aktivnosti, {
        fields: [notifikacije.aktivnostId],
        references: [aktivnosti.id],
    }),
}));

export const aktivnostiRelacije = relations(aktivnosti, ({ many }) => ({
    notifikacije: many(notifikacije),
}));
