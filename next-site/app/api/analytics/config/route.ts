import { NextResponse, connection } from "next/server";
import { analyticsAllowed } from "@/lib/book-launch/server";
export async function GET(request: Request) {
  await connection();
  return NextResponse.json({ enabled: analyticsAllowed(request) }, { headers: { "Cache-Control": "private, no-store", "Vary": "Sec-GPC, DNT" } });
}
