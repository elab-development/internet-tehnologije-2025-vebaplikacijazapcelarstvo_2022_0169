import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { kosnice } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id: pcelinjakId } = await ctx.params;

    const rows = await db
      .select()
      .from(kosnice)
      .where(eq(kosnice.pcelinjakId, pcelinjakId))
      .orderBy(asc(kosnice.broj));

    return NextResponse.json(rows);
  } catch (e) {
    console.error("GET kosnice error:", e);
    return NextResponse.json(
      { error: "Greška pri učitavanju košnica" },
      { status: 500 }
    );
  }
}
