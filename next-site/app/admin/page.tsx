import Link from "next/link";
import { authConfigured, currentUser, isOwner } from "@/lib/supabase";
import { AuthPanel } from "@/components/auth-panel";

export const metadata = {
  title: "Your writing desk",
  robots: { index: false, follow: false },
};

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ spotify?: string }>;
}) {
  const params = await searchParams;
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
            This private area will let you add inspiration, connect Spotify, and
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
            <Link href="/admin/share">Add to Commonplace →</Link>
            <Link href="/admin/comments">Review comments →</Link>
          </nav>
          <div className="admin-panel">
            <h2>On the speakers</h2>
            {params.spotify === "connected" && (
              <p role="status" className="status-message">
                Spotify is connected. Play a track and check the Commonplace
                Book.
              </p>
            )}
            {params.spotify === "retry" && (
              <p role="status" className="status-message error">
                Spotify didn’t finish connecting. Please try again.
              </p>
            )}
            <p>
              Connect your own Spotify account to show the track you’re playing.
            </p>
            <p className="form-help">
              Spotify asks for permission to read your currently playing track.
              Your password stays with Spotify.
            </p>
            <a className="button" href="/api/spotify/connect">
              Connect Spotify ↗
            </a>
          </div>
          <p className="short-note">
            Writing counts and page copy live in the project files. We can
            update those together.
          </p>
        </>
      )}
    </div>
  );
}
