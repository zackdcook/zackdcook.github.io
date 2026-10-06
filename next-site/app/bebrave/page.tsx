import { BeBraveExperience } from "@/components/bebrave-experience";
import { beBraveConfigured } from "@/lib/bebrave-server";

export const metadata = {
  title: "Be Brave",
  description: "A shared cypress tree that keeps every mark in its place.",
  robots: { index: false, follow: false },
};

export default function BeBravePage() {
  return <>
    <BeBraveExperience enabled={beBraveConfigured()} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}/>
    <noscript><p className="shell">The Be Brave tree needs JavaScript for its shared drawing, timer, and local timeline.</p></noscript>
  </>;
}
