import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/content/site";
import "./globals.css";
import "./living-cypress.css";
import "./cypress.css";
import "./swamp-timeline.css";
import "./materials.css";
import "./folly.css";
import "./bebrave.css";
import { Suspense } from "react";
import { SitePreferences } from "@/components/site-preferences";
import { PointerLight } from "@/components/pointer-light";
import { SiteIcons } from "@/components/site-icons";
import { OrganicTransition } from "@/components/organic-transition";
import { preferenceBootstrap } from "@/lib/preferences";

// A soft, open-source alternative to MADE Gentle's paid webfont license.
const displayFont = localFont({
  src: "../public/fonts/Fraunces-Soft-Semibold.ttf",
  weight: "650",
  style: "normal",
  variable: "--font-author-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.title}`,
  },
  description: site.description,
  icons: { icon: { url: site.icon, type: "image/svg+xml", sizes: "any" }, apple: { url: site.appleIcon, sizes: "180x180", type: "image/png" } },
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [
      {
        url: site.shareImage,
        width: 1200,
        height: 630,
        alt: site.title,
      },
    ],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: [site.shareImage] },
  robots:
    process.env.SITE_LIVE === "true" && process.env.VERCEL_ENV !== "preview"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={displayFont.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrap }} />
        <link rel="alternate" type="application/rss+xml" title="Zack Cook — Words of Folly" href={`${site.url}/journal/feed.xml`} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SitePreferences>
          <PointerLight />
          <SiteIcons />
          <Suspense fallback={<header className="site-header"><div className="shell">Zack Cook</div></header>}><SiteHeader /></Suspense>
          <OrganicTransition name="zacks-corner">
            <div id="page-sheet">
              <main id="main" tabIndex={-1}>
                <Suspense fallback={<div className="shell page-wrap loading-leaf" role="status">Opening a new leaf…</div>}>
                  {children}
                </Suspense>
              </main>
              <SiteFooter />
            </div>
          </OrganicTransition>
        </SitePreferences>
      </body>
    </html>
  );
}
