import { NextResponse } from "next/server";

// Article conversations are retired with the essay; quotes are read-only content.
export function GET() {
  return NextResponse.json({ error: "This journal entry has been retired." }, { status: 410 });
}
export const POST = GET;
