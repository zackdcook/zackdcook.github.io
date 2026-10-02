import "server-only";

export function submissionSetup() {
  return {
    enabled: process.env.PUBLIC_SUBMISSIONS_ENABLED === "true",
    database: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)),
    signIn: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.ZACK_ADMIN_EMAIL),
    turnstile: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY),
    hashKey: Boolean(process.env.SUBMISSION_HMAC_KEY && process.env.SUBMISSION_HMAC_KEY.length >= 32),
    notifications: Boolean(process.env.RESEND_API_KEY && process.env.SUBMISSION_EMAIL_FROM && process.env.ZACK_ADMIN_EMAIL),
  };
}
export function submissionsConfigured() { return Object.values(submissionSetup()).every(Boolean); }
