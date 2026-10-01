import type { Metadata } from "next";
import { Zain } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/content/site";
import "./globals.css";

const zain = Zain({
  weight: ["700", "800"],
  subsets: ["latin"],
  variable: "--font-zain",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zackdcook.com"),
  title: {
    default: "Zack Cook — Fiction writer & engineer",
    template: "%s · Zack Cook",
  },
  description: site.description,
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Zack Cook — Fiction writer & engineer",
    description: site.description,
    images: [
      {
        url: "/images/portrait.webp",
        width: 1200,
        height: 1200,
        alt: "Zack Cook",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
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
    <html lang="en" className={zain.variable}>
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
