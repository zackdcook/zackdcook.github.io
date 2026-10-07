import Link from "next/link";
import { authConfigured, currentUser, isOwner } from "@/lib/supabase";
import { AuthPanel } from "@/components/auth-panel";

export const metadata = {
  title: "Your writing desk",
  robots: { index: false, follow: false },
};

export default async function Admin() {
  const user = await currentUser();
  return (
    <div className="shell page-wrap admin-page">
      <div className="page-intro">
        <p className="eyebrow">Private tools</p>
        <h1>
          Your
          <br />
          <em>writing desk.</em>
        </h1>
      </div>
      {!authConfigured() ? (
        <div className="admin-panel">
          <h2>Connect the accounts</h2>
          <p>
            This private area will let you add inspiration and
            review comments.
          </p>
          <p>
            The Supabase settings and your owner email need to be added before
            sign-in is enabled. The setup guide is in the project README.
          </p>
        </div>
      ) : !user ? (
        <AuthPanel
          next="/admin"
          google={process.env.GOOGLE_AUTH_ENABLED === "true"}
          facebook={process.env.FACEBOOK_AUTH_ENABLED === "true"}
          emailEnabled={process.env.EMAIL_OTP_ENABLED === "true"}
        />
      ) : !isOwner(user) ? (
        <div className="admin-panel">
          <h2>This desk belongs to Zack.</h2>
          <p>You can still read, share, and join the journal conversations.</p>
        </div>
      ) : (
        <>
          <nav className="admin-nav" aria-label="Private tools">
            <Link href="/admin/comments">Review comments</Link>
          </nav>
          <p className="short-note">
            Writing counts and page copy live in the project files. We can
            update those together.
          </p>
        </>
      )}
    </div>
  );
}
