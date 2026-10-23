import { BeBraveExperience } from "@/components/bebrave-experience";
import { beBraveConfigured, beBraveTestMode } from "@/lib/bebrave-server";

export const metadata = {
  title:"Guestbook",
  alternates:{ canonical:"/guestbook" },
  openGraph:{ title:"Guestbook",url:"/guestbook",description:"A shared cypress tree that keeps every mark in its place." },
  twitter:{ title:"Guestbook",description:"A shared cypress tree that keeps every mark in its place." },
  description:"A shared cypress tree that keeps every mark in its place.",
  robots:{ index:false, follow:false },
};

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
