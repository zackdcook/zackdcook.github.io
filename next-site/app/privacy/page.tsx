import { pageMetadata } from "@/lib/page-metadata";
import { AnalyticsChoice } from "@/components/book-launch/analytics";

export const metadata = pageMetadata("privacy");

export default function Privacy() {
  return <div className="shell page-wrap prose-page">
    <div className="page-intro"><h1>A note<br/>about <em>privacy.</em></h1></div>
    <div className="prose">
      <p>Book alerts store your email, signup consent and time, signup placement, and coarse referral/country information to send exactly one announcement when the first edition of my debut novel is released. Your email is not sent to analytics or linked to your browsing history. Signup records are kept until that announcement is sent or you request removal.</p>
      <p>Ongoing newsletters are a separate, optional subscription. I only add you when you explicitly select the newsletter checkbox. Newsletter consent and unsubscribe history are stored separately from the one-time book announcement. Every newsletter includes a personal unsubscribe link; you can also email hi@zackdcook.com to leave either list. Unsubscribing from newsletters does not change your book announcement choice. Minimal suppression and consent records are kept to respect your choice and prevent unwanted sends.</p>
      <p>Site interactions and games may publish anonymous contributions, which remain until removed. An essential, random browser cookie, short-lived security hashes, and rate limits protect these interactions. Raw IP addresses are not stored in the site database. Appearance, game progress, and signup/analytics choices are remembered in your browser; your email is not stored there.</p>
      <p>The Guestbook uses a secret-keyed hash of your connection (an IPv6 subnet where applicable) to limit repeated participation, including after cookies are cleared. These private security records expire after seven days and are deleted hourly. Human-check token hashes expire after ten minutes. These signals are used only to protect the game, not for analytics or advertising, and do not identify your device or merge players sharing Wi-Fi. A shared connection has a limited allowance, so other people on it may occasionally need to wait.</p>
      <p>Where enabled, PostHog measures anonymous US visits and interactions without analytics cookies, person profiles, session recordings, or automatic click tracking. It respects Global Privacy Control and Do Not Track. You can opt out below.</p>
      <AnalyticsChoice />
      <p>Vercel, Supabase, Cloudflare Turnstile, and PostHog process data to host, store, protect, and measure the site, including network requests under their own retention policies. I do not sell your information or share it for targeted advertising.</p>
      <p>For access, correction, or removal requests, email <a href="mailto:hi@zackdcook.com">hi@zackdcook.com</a>.</p>
    </div>
  </div>;
}
