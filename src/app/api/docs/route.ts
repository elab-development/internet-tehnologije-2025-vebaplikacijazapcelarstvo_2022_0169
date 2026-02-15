/**
 * @openapi
 * /api/docs:
 *   get:
 *     summary: OpenAPI (Swagger) specifikacija u JSON formatu
 *     description: Vraća generisanu OpenAPI 3.0 specifikaciju za ceo API.
 *     responses:
 *       200:
 *         description: OK
 */


import { NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger";

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
