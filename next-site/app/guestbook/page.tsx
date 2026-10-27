import { pageMetadata } from "@/lib/page-metadata";
import { BeBraveExperience } from "@/components/bebrave-experience";
import { beBraveConfigured, beBraveTestMode } from "@/lib/bebrave-server";

export const metadata = pageMetadata("guestbook");

export default function GuestbookPage() {
  return <>
    <BeBraveExperience
      enabled={beBraveConfigured()}
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
      testMode={beBraveTestMode()}
    />
    <noscript><p className="shell">The Guestbook tree needs JavaScript for its shared drawing and local timeline.</p></noscript>
  </>;
}
