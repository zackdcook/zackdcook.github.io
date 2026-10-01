import Link from "next/link";
import { ShareForm } from "@/components/share-form";
import { AuthPanel } from "@/components/auth-panel";
import { authConfigured, currentUser, isOwner } from "@/lib/supabase";
import { normalizeSharedUrl } from "@/lib/validation";

export const metadata = {
  title: "Add to Commonplace",
  robots: { index: false, follow: false },
};

export default async function Share({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; text?: string }>;
}) {
  const params = await searchParams;
  let url = "";
  try {
    url = normalizeSharedUrl(params.url || params.text || "");
  } catch {}
  const user = await currentUser();
  const next = `/admin/share${url ? `?url=${encodeURIComponent(url)}` : ""}`;
  return (
    <div className="shell page-wrap admin-page">
      <Link className="text-link" href="/admin">
        ← Your desk
      </Link>
      <div className="page-intro">
        <p className="eyebrow">Keep something good</p>
        <h1>
          Add to
          <br />
          <em>Commonplace.</em>
        </h1>
        <p>A link, a title, and a note if you feel like it.</p>
      </div>
      {!authConfigured() ? (
        <div className="admin-panel">
          <h2>Sharing-page preview</h2>
          <p className="form-help">
            Account and database setup is still required. Saving will report an
            error until the connection is configured.
          </p>
          <ShareForm initialUrl={url} />
        </div>
      ) : !user ? (
        <AuthPanel
          next={next}
          google={process.env.GOOGLE_AUTH_ENABLED === "true"}
          facebook={process.env.FACEBOOK_AUTH_ENABLED === "true"}
          emailEnabled={process.env.EMAIL_OTP_ENABLED === "true"}
        />
      ) : isOwner(user) ? (
        <div className="admin-panel">
          <ShareForm initialUrl={url} />
        </div>
      ) : (
        <p>Only Zack can add items here.</p>
      )}
    </div>
  );
}
