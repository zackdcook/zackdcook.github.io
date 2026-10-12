import { AnalyticsChoice } from "@/components/book-launch/analytics";

export const metadata = {
  title: "Privacy",
  description: "How this site handles book-alert signups, anonymous analytics, and site interactions.",
  alternates: { canonical: "https://zackdcook.com/privacy" },
};

export default function Privacy() {
  return <div className="shell page-wrap prose-page">
    <div className="page-intro"><h1>A note<br/><em>about privacy.</em></h1></div>
    <div className="prose">
      <p>Book alerts store your email, signup consent and time, signup placement, and coarse referral/country information to send exactly one announcement when the first edition of my debut novel is released. Your email is not sent to analytics or linked to your browsing history. Signup records are kept until that announcement is sent or you request removal.</p>
      <p>Site interactions and games may publish anonymous contributions, which remain until removed. An essential, random browser cookie, short-lived security hashes, and rate limits protect these interactions. Raw IP addresses are not stored in the site database. Appearance, game progress, and signup/analytics choices are remembered in your browser; your email is not stored there.</p>
      <p>Where enabled, PostHog measures anonymous US visits and interactions without analytics cookies, person profiles, session recordings, or automatic click tracking. It respects Global Privacy Control and Do Not Track. You can opt out below.</p>
      <AnalyticsChoice />
      <p>Vercel, Supabase, Cloudflare Turnstile, and PostHog process data to host, store, protect, and measure the site, including network requests under their own retention policies. I do not sell your information or share it for targeted advertising.</p>
      <p>For access, correction, or removal requests, email <a href="mailto:hi@zackdcook.com">hi@zackdcook.com</a>.</p>
    </div>
  </div>;
}
