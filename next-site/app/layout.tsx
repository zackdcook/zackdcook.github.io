import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/content/site";
import "./globals.css";

// The original Indigo Regular font is bundled unchanged with its SIL OFL license.
const displayFont = localFont({
  src: "../public/fonts/Indigo-Regular.otf",
  weight: "400",
  style: "normal",
  variable: "--font-author-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s · Zack Cook — Engineer & aspiring author",
  },
  description: site.description,
  icons: { icon: site.icon, apple: site.icon },
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
    process.env.SITE_LIVE === "true"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={displayFont.variable}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="Zack Cook — Words of Folly" href={`${site.url}/journal/feed.xml`} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
