import Link from "next/link";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <div>
        <Link className="footer-name" href="/">
          Zack Cook.
        </Link>
        <p>Lakeland, Florida. Usually making something.</p>
      </div>
      <div className="footer-links">
        <Link href="/events">Find Me At…</Link>
        <a href={`mailto:${site.email}`}>
          Say hello <span aria-hidden="true">↗</span>
        </a>
        <Link href="/journal/feed.xml">RSS</Link>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Zack Cook</p>
    </footer>
  );
}
