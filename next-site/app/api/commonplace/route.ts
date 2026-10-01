import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  requireOwner,
  serverSupabase,
  registerOwner,
  checkOrigin,
  authConfigured,
} from "@/lib/supabase";
import { validateEntry } from "@/lib/validation";

export async function POST(request: Request) {
  if (!authConfigured())
    return NextResponse.json(
      {
        error:
          "The database connection is not configured yet. Nothing was saved.",
      },
      { status: 503 },
    );
  let user;
  try {
    user = await requireOwner();
  } catch {
    return NextResponse.json(
      { error: "Owner sign-in required." },
      { status: 401 },
    );
  }
  try {
    checkOrigin(request);
    const raw = await request.text();
    if (raw.length > 10000) throw new Error("Shorten the entry and try again.");
    const data = validateEntry(JSON.parse(raw));
    await registerOwner(user.id);
    const client = await serverSupabase();
    const { error } = await client
      .from("commonplace_entries")
      .insert({ ...data, created_by: user.id });
    if (error)
      throw new Error(
        "Could not save the entry. Check the database setup and try again.",
      );
    revalidatePath("/commonplace");
    revalidatePath("/");
    return NextResponse.json({ saved: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save." },
      { status: 400 },
    );
  }
}
