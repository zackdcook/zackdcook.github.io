import { NextResponse } from "next/server";
import { journalPost } from "@/content/site";
import {
  authConfigured,
  currentUser,
  serverSupabase,
  serviceSupabase,
  checkOrigin,
} from "@/lib/supabase";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  const { slug } = await context.params;
  if (slug !== journalPost.slug)
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  if (!authConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json({ enabled: false });
  try {
    const user = await currentUser();
    const client = serviceSupabase();
    const [comments, likes, liked] = await Promise.all([
      client
        .from("journal_comments")
        .select("id,display_name,body,created_at")
        .eq("post_slug", slug)
        .eq("status", "published")
        .order("created_at", { ascending: true })
        .limit(100),
      client
        .from("journal_likes")
        .select("user_id", { count: "exact", head: true })
        .eq("post_slug", slug),
      user
        ? client
            .from("journal_likes")
            .select("post_slug")
            .eq("post_slug", slug)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    if (comments.error || likes.error)
      throw new Error("Comments are unavailable.");
    return NextResponse.json(
      {
        enabled: true,
        comments: comments.data,
        likes: likes.count || 0,
        signedIn: Boolean(user),
        liked: Boolean(liked.data),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { enabled: false, error: "Comments are unavailable right now." },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: Request, context: Context) {
  const { slug } = await context.params;
  if (slug !== journalPost.slug)
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  const user = await currentUser();
  if (!user || !user.email_confirmed_at)
    return NextResponse.json(
      { error: "Sign in to join the conversation." },
      { status: 401 },
    );
  try {
    checkOrigin(request);
    const data = await request.json();
    const client = await serverSupabase();
    if (data.kind === "like") {
      const { data: existing } = await client
        .from("journal_likes")
        .select("post_slug")
        .eq("post_slug", slug)
        .eq("user_id", user.id)
        .maybeSingle();
      const { error } = existing
        ? await client
            .from("journal_likes")
            .delete()
            .eq("post_slug", slug)
            .eq("user_id", user.id)
        : await client
            .from("journal_likes")
            .insert({ post_slug: slug, user_id: user.id });
      if (error)
        throw new Error("Could not update your like. Please try again.");
      const { count } = await serviceSupabase()
        .from("journal_likes")
        .select("post_slug", { count: "exact", head: true })
        .eq("post_slug", slug);
      return NextResponse.json({ liked: !existing, likes: count || 0 });
    }
    if (
      data.kind !== "comment" ||
      typeof data.body !== "string" ||
      !data.body.trim() ||
      data.body.trim().length > 2000
    )
      throw new Error("Write a comment of up to 2,000 characters.");
    const name = String(
      user.user_metadata.full_name || user.user_metadata.name || "Reader",
    ).slice(0, 100);
    const { error } = await client
      .from("journal_comments")
      .insert({
        post_slug: slug,
        user_id: user.id,
        display_name: name,
        body: data.body.trim(),
        status: "pending",
      });
    if (error)
      throw new Error("Could not add the comment. Please try again later.");
    return NextResponse.json({ pending: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save." },
      { status: 400 },
    );
  }
}
