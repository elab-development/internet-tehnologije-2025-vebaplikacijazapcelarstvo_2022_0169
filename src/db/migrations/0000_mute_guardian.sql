CREATE TABLE "aktivnosti" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"naziv" varchar(255) NOT NULL,
	"opis" varchar(512),
	"tip" varchar(100),
	"datum" timestamp,
	"uradjen" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "dnevnici" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"datum" timestamp DEFAULT now(),
	"vreme" varchar(50),
	"slika" varchar(512),
	"kolicina_meda" numeric(10, 2),
	"pregled" varchar(512),
	"komentar" varchar(512),
	"kosnica_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "izvestaji" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"datum_od" timestamp NOT NULL,
	"datum_do" timestamp NOT NULL,
	"korisnik_id" uuid NOT NULL,
	"pcelinjak_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "korisnici" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ime" varchar(100) NOT NULL,
	"prezime" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"sifra" varchar(255) NOT NULL,
	"uloga" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "korisnici_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "kosnice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"broj" integer NOT NULL,
	"tip" varchar(100),
	"datum" timestamp DEFAULT now(),
	"starost_matice" integer,
	"br_nastavaka" integer,
	"pcelinjak_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifikacije" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"korisnik_id" uuid NOT NULL,
	"aktivnost_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pcelinjaci" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"naziv" varchar(255) NOT NULL,
	"adresa" varchar(255),
	"geo_sirina" numeric(10, 8),
	"geo_duzina" numeric(11, 8)
);
--> statement-breakpoint
ALTER TABLE "dnevnici" ADD CONSTRAINT "dnevnici_kosnica_id_kosnice_id_fk" FOREIGN KEY ("kosnica_id") REFERENCES "public"."kosnice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "izvestaji" ADD CONSTRAINT "izvestaji_korisnik_id_korisnici_id_fk" FOREIGN KEY ("korisnik_id") REFERENCES "public"."korisnici"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "izvestaji" ADD CONSTRAINT "izvestaji_pcelinjak_id_pcelinjaci_id_fk" FOREIGN KEY ("pcelinjak_id") REFERENCES "public"."pcelinjaci"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kosnice" ADD CONSTRAINT "kosnice_pcelinjak_id_pcelinjaci_id_fk" FOREIGN KEY ("pcelinjak_id") REFERENCES "public"."pcelinjaci"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifikacije" ADD CONSTRAINT "notifikacije_korisnik_id_korisnici_id_fk" FOREIGN KEY ("korisnik_id") REFERENCES "public"."korisnici"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifikacije" ADD CONSTRAINT "notifikacije_aktivnost_id_aktivnosti_id_fk" FOREIGN KEY ("aktivnost_id") REFERENCES "public"."aktivnosti"("id") ON DELETE cascade ON UPDATE no action;