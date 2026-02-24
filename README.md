# 🐝 Sistem za upravljanje pčelarstvom

## Pregled sistema

Sistem za upravljanje pčelarstvom je web aplikacija namenjena pčelarima za organizaciju i praćenje rada na pčelinjacima.  
Omogućava centralizovano upravljanje podacima, pregled lokacija pčelinjaka na mapi, evidenciju aktivnosti i vođenje dnevnika rada.

Aplikacija je razvijena kao full-stack rešenje sa integracijom baze podataka, eksternih servisa i sigurnosnih mehanizama.

---

## Funkcionalnosti

Sistem obezbeđuje sledeće funkcionalnosti:

### Upravljanje podacima (CRUD operacije)

- Korisnik
- Pčelinjak
- Košnica
- Aktivnost
- Dnevnik

### Dodatne funkcionalnosti

- Registracija i prijava korisnika (JWT autentifikacija)
- Middleware zaštita API ruta
- Vizualizacija pčelinjaka na Google Maps mapi
- Integracija sa OpenWeather API servisom
- Slanje email notifikacija putem Resend servisa
- Preuzimanje izveštaja u PDF formatu
- Automatizovane migracije baze podataka
- Testiranje aplikacije uz coverage izveštaj

---

## Arhitektura sistema

Aplikacija je razvijena kao moderna full-stack arhitektura:

- Frontend sloj – Next.js (React)
- Backend sloj – Next.js API rute
- ORM sloj – Drizzle ORM
- Baza podataka – PostgreSQL
- Autentifikacija – JWT

Sistem može raditi lokalno ili unutar Docker kontejnera.

---


## Korišćene tehnologije

- Next.js
- TypeScript
- PostgreSQL
- Drizzle ORM
- JSON Web Token (JWT)
- Resend (Email servis)
- OpenWeather API
- Docker i Docker Compose
- Jest (testiranje)
- GitHub Actions (CI/CD)

---

## Konfiguracija okruženja

Pre pokretanja aplikacije potrebno je kreirati `.env` fajl na osnovu `.env.example`.


## Pokretanje aplikacije (lokalno)

### 1. Instalacija zavisnosti

```bash
npm install
```

### 2. Pokretanje PostgreSQL baze

Potrebno je da PostgreSQL server bude instaliran i pokrenut.  
Kreirati bazu pod nazivom:

```
pcelarstvo
```

### 3. Pokretanje migracija

Migracije se izvršavaju komandom:

```bash
npm run db:migrate
```

### 4. (Opcionalno) Inicijalizacija baze

```bash
npm run db:seed
```

### 5. Pokretanje aplikacije

```bash
npm run dev
```

Aplikacija je dostupna na:

```
http://localhost:3000
```

---

## Pokretanje pomoću Docker-a

Projekat koristi Docker Compose za orkestraciju servisa.

### Pokretanje aplikacije i baze

```bash
docker compose up --build
```

Ova komanda pokreće:

- PostgreSQL bazu
- Web aplikaciju

Migracije baze se automatski izvršavaju pri startu aplikacije.

Aplikacija je dostupna na:

```
http://localhost:3000
```

### (Opcionalno) Seed baze u Docker okruženju

```bash
docker compose --profile ops up seed
```

---

## CI/CD

Projekat koristi GitHub Actions za automatizovanu integraciju i testiranje.

Pipeline obuhvata:

- Instalaciju zavisnosti
- Pokretanje testova
- Generisanje coverage izveštaja
- Build aplikacije
- Docker build proces

CI proces se automatski pokreće pri svakom push-u ili pull request-u.

---

## Testiranje

Pokretanje testova:

```bash
npm run test
```

Pokretanje testova sa coverage izveštajem:

```bash
npm run test:coverage
```

---

## Bezbednost sistema

Aplikacija implementira zaštitu od najčešćih web ranjivosti:

- JWT autentifikacija i autorizacija
- XSS zaštita (validacija i sanitizacija unosa)
- CSRF zaštita
- Sigurno upravljanje kolačićima
- Korišćenje environment varijabli za osetljive podatke

---

## Autor

Projekat je razvijen u okviru predmeta Internet Tehnologije.