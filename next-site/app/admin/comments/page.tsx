import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  currentUser,
  isOwner,
  requireOwner,
  registerOwner,
  serverSupabase,
  authConfigured,
} from "@/lib/supabase";

export const metadata = {
  title: "Review comments",
  robots: { index: false, follow: false },
};

async function moderate(form: FormData) {
  "use server";
  const user = await requireOwner();
  await registerOwner(user.id);
  const id = String(form.get("id") || "");
  const action = form.get("action");
  if (
    !/^[a-f0-9-]{36}$/.test(id) ||
    !["approve", "remove"].includes(String(action))
  )
    throw new Error("Invalid moderation request.");
  const client = await serverSupabase();
  const { error } =
    action === "approve"
      ? await client
          .from("journal_comments")
          .update({ status: "published" })
          .eq("id", id)
      : await client.from("journal_comments").delete().eq("id", id);
  if (error) throw new Error("The comment could not be updated.");
  revalidatePath("/admin/comments");
}

export default async function Comments() {
  if (!authConfigured())
    return (
      <div className="shell page-wrap admin-page">
        <h1>Review comments</h1>
        <p>Database and sign-in setup is required first.</p>
      </div>
    );
  const user = await currentUser();
  if (!isOwner(user)) redirect("/login?next=/admin/comments");
  await registerOwner(user!.id);
  const client = await serverSupabase();
  const { data, error } = await client
    .from("journal_comments")
    .select("id,body,display_name,post_slug")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(100);
  return (
    <div className="shell page-wrap admin-page">
      <Link className="text-link" href="/admin">
        ← Your desk
      </Link>
      <div className="page-intro">
        <p className="eyebrow">Before they go public</p>
        <h1>
          Review
          <br />
          <em>comments.</em>
        </h1>
      </div>
      {error ? (
        <p>Could not load comments. Check the database setup.</p>
      ) : !data?.length ? (
        <p>No comments waiting for review.</p>
      ) : (
        data.map((comment) => (
          <article className="moderation-entry" key={comment.id}>
            <strong>{comment.display_name}</strong>
            <p>{comment.body}</p>
            <form action={moderate} className="actions">
              <input type="hidden" name="id" value={comment.id} />
              <button className="button" name="action" value="approve">
                Approve
              </button>
              <button className="button secondary" name="action" value="remove">
                Remove
              </button>
            </form>
          </article>
        ))
      )}
    </div>
  );
}
