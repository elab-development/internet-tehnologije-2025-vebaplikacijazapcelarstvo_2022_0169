import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import type PDFKit from "pdfkit";
import { db } from "@/db";
import { dnevnici, kosnice, pcelinjaci } from "@/db/schema";
import { and, eq, gte, lte, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function todayStrLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isValidISODateOnly(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function parseDateOnlyToUtc(dateStr: string, endOfDay: boolean): Date | null {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  if (!endOfDay) return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
}

function formatDate(v: unknown) {
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}.`;
}

function safeText(v: unknown) {
  return (v ?? "").toString();
}

function loadFromPublic(relPath: string) {
  const full = path.join(process.cwd(), "public", relPath);
  if (!fs.existsSync(full)) throw new Error(`Fajl ne postoji: public/${relPath}`);
  return full;
}

function collectPdfBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function pdfResponse(pdf: Buffer, filename: string) {
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);

    const pcelinjakId = (searchParams.get("pcelinjakId") ?? "").trim();
    const kosnicaId = (searchParams.get("kosnicaId") ?? "").trim();
    const dateFrom = (searchParams.get("dateFrom") ?? "").trim();
    const dateTo = (searchParams.get("dateTo") ?? "").trim();

    if (!pcelinjakId) return NextResponse.json({ error: "Nedostaje pcelinjakId" }, { status: 400 });
    if (!dateFrom || !dateTo) return NextResponse.json({ error: "Nedostaju datumi" }, { status: 400 });
    if (!isValidISODateOnly(dateFrom) || !isValidISODateOnly(dateTo)) {
      return NextResponse.json({ error: "Datumi moraju biti YYYY-MM-DD" }, { status: 400 });
    }

    const today = todayStrLocal();
    if (dateFrom > today || dateTo > today) {
      return NextResponse.json({ error: "Datumi moraju biti u prošlosti ili danas." }, { status: 400 });
    }
    if (dateFrom > dateTo) {
      return NextResponse.json({ error: "Datum od ne može biti posle datuma do." }, { status: 400 });
    }

    const fromUtc = parseDateOnlyToUtc(dateFrom, false);
    const toUtc = parseDateOnlyToUtc(dateTo, true);
    if (!fromUtc || !toUtc) return NextResponse.json({ error: "Nevalidni datumi" }, { status: 400 });

    const p = await db
      .select({ naziv: pcelinjaci.naziv })
      .from(pcelinjaci)
      .where(eq(pcelinjaci.id, pcelinjakId));

    const pNaziv = p[0]?.naziv ?? "Pčelinjak";

    const filters = [
      eq(kosnice.pcelinjakId, pcelinjakId),
      gte(dnevnici.datum, fromUtc),
      lte(dnevnici.datum, toUtc),
    ];
    if (kosnicaId) filters.push(eq(dnevnici.kosnicaId, kosnicaId));

    const rows = await db
      .select({
        datum: dnevnici.datum,
        kolicinaMeda: dnevnici.kolicinaMeda,
        pregled: dnevnici.pregled,
        komentar: dnevnici.komentar,
        brojKosnice: kosnice.broj,
      })
      .from(dnevnici)
      .innerJoin(kosnice, eq(dnevnici.kosnicaId, kosnice.id))
      .where(and(...filters))
      .orderBy(asc(dnevnici.datum));

   
    const fontRegular = loadFromPublic("fonts/Montserrat-Regular.ttf");
    const fontBold = loadFromPublic("fonts/Montserrat-Bold.ttf");
    const logoPath = loadFromPublic("logo.png");

    
    const doc = new PDFDocument({ size: "A4", margin: 48, font: fontRegular });


    doc.font(fontRegular);


    doc.image(logoPath, 48, 40, { width: 110 });

    doc.moveDown(3);
    doc.font(fontBold).fontSize(18).fillColor("#111").text("Izveštaj dnevnika");

    doc.moveDown(0.5);
    doc.font(fontRegular).fontSize(11).fillColor("#333");
    doc.text(`Pčelinjak: ${pNaziv}`);
    doc.text(`Period: ${dateFrom} — ${dateTo}`);
    doc.text(`Košnica: ${kosnicaId ? "izabrana" : "sve košnice"}`);

    doc.moveDown(0.8);
    doc.moveTo(doc.x, doc.y).lineTo(548, doc.y).strokeColor("#dddddd").stroke();
    doc.moveDown(0.8);

    if (rows.length === 0) {
      doc.font(fontRegular).fontSize(12).fillColor("#444").text("Nema unosa za izabrane parametre.");
      const pdf = await collectPdfBuffer(doc);
      return pdfResponse(pdf, `izvestaj_dnevnik_${dateFrom}_${dateTo}.pdf`);
    }

    const startX = doc.x;
    let y = doc.y;
    const pageBottom = 780;

    const col = {
      datum: startX,
      kosnica: startX + 90,
      med: startX + 150,
      pregled: startX + 210,
      komentar: startX + 380,
    };

    const tableHeader = () => {
      doc.font(fontBold).fontSize(10).fillColor("#000");
      doc.text("Datum", col.datum, y, { width: 85 });
      doc.text("Košnica", col.kosnica, y, { width: 55 });
      doc.text("Med (kg)", col.med, y, { width: 55 });
      doc.text("Pregled", col.pregled, y, { width: 165 });
      doc.text("Komentar", col.komentar, y, { width: 160 });

      doc.font(fontRegular).fillColor("#222");
      y += 16;
      doc.moveTo(startX, y).lineTo(548, y).strokeColor("#eaeaea").stroke();
      y += 8;
    };

    tableHeader();

    for (const r of rows) {
      const datum = formatDate(r.datum);
      const kosnicaBroj = r.brojKosnice != null ? `#${r.brojKosnice}` : "";
      const med = r.kolicinaMeda == null ? "" : safeText(r.kolicinaMeda);
      const pregled = safeText(r.pregled);
      const komentar = safeText(r.komentar);

      doc.font(fontRegular).fontSize(10).fillColor("#222");

      const hPregled = doc.heightOfString(pregled, { width: 165 });
      const hKomentar = doc.heightOfString(komentar, { width: 160 });
      const rowH = Math.max(14, hPregled, hKomentar);

      if (y + rowH > pageBottom) {
        doc.addPage();
        doc.font(fontRegular);
        y = doc.y;
        tableHeader();
      }

      doc.text(datum, col.datum, y, { width: 85 });
      doc.text(kosnicaBroj, col.kosnica, y, { width: 55 });
      doc.text(med, col.med, y, { width: 55 });
      doc.text(pregled, col.pregled, y, { width: 165 });
      doc.text(komentar, col.komentar, y, { width: 160 });

      y += rowH + 10;
      doc.moveTo(startX, y - 4).lineTo(548, y - 4).strokeColor("#f3f3f3").stroke();
    }

    doc.moveDown(0.5);
    doc.font(fontRegular).fontSize(9).fillColor("#666").text(`Ukupno unosa: ${rows.length}`);

    const pdf = await collectPdfBuffer(doc);
    return pdfResponse(pdf, `izvestaj_dnevnik_${dateFrom}_${dateTo}.pdf`);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Greška na serveru" }, { status: 500 });
  }
}