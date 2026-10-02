import { Cormorant_Garamond, Stack_Sans_Notch } from "next/font/google";
import Home from "@/app/page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./design-preview.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const stack = Stack_Sans_Notch({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-stack", display: "swap", adjustFontFallback: false });

export const metadata = { title: "Homepage design studies", robots: { index: false, follow: false }, alternates: { canonical: "/design-preview" } };

const themes = {
  copper: { name: "Copper & parchment", font: "Fraunces", description: "My pick for the cozy library feeling. A curvy, substantial serif with copper, parchment, and mist. Fraunces is a free alternative to your Bringbold Nineties and Bruleni references." },
  olive: { name: "Olive & midnight violet", font: "Cormorant Garamond", description: "More literary and elegant, with floral white, olive, violet, and a little coral. Cormorant Garamond is a free alternative to the high-contrast Kiava reference." },
  everglade: { name: "Everglade & peony", font: "Stack Sans Notch", description: "The most playful option: deep teal, warm yellow, and a little pink. This uses the actual Stack Sans Notch font from your reference." },
} as const;

export default async function DesignPreview({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const params = await searchParams;
  const key = params.theme && params.theme in themes ? params.theme as keyof typeof themes : "copper";
  const theme = themes[key];
  return <div className={`design-preview design-preview--${key} ${cormorant.variable} ${stack.variable}`}>
    <aside className="design-toolbar" aria-label="Compare homepage designs">
      <div><p>Homepage design studies</p><h1>{theme.name}</h1><p>{theme.font} headings · DM Sans for reading</p></div>
      <form action="/design-preview" method="get"><label htmlFor="theme">Try a direction</label><select id="theme" name="theme" defaultValue={key}>{Object.entries(themes).map(([value, item]) => <option key={value} value={value}>{item.name}</option>)}</select><button type="submit">View design</button><a href="/">Back to the live site</a></form>
      <p className="design-description">{theme.description} These studies keep your words and layout; they do not change the main homepage.</p>
    </aside>
    <SiteHeader />
    <Home />
    <SiteFooter />
  </div>;
}
