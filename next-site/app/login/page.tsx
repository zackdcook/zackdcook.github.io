import { AuthPanel } from "@/components/auth-panel";
import { authConfigured } from "@/lib/supabase";
import { safeReturnPath } from "@/lib/validation";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="shell page-wrap admin-page">
      <p className="eyebrow">Welcome back</p>
      {authConfigured() ? (
        <AuthPanel
          next={safeReturnPath(params.next)}
          google={process.env.GOOGLE_AUTH_ENABLED === "true"}
          facebook={process.env.FACEBOOK_AUTH_ENABLED === "true"}
          emailEnabled={process.env.EMAIL_OTP_ENABLED === "true"}
        />
      ) : (
        <div className="admin-panel">
          <h2>Account setup comes next.</h2>
          <p>
            The design preview is ready to browse. Sign-in needs the Supabase
            project configuration before it can be used.
          </p>
        </div>
      )}
    </div>
  );
}
