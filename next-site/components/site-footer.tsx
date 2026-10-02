import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { DollarIcon, MailIcon, RssIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <div className="footer-links">
        <a className="button button-small" href={`mailto:${site.email}`}>
          <MailIcon /> Say hello
        </a>
        {site.instagram && <a className="button button-small" href={site.instagram} target="_blank" rel="noopener noreferrer"><Image src="/icons/instagram.svg" alt="" width={20} height={20} /> Instagram</a>}
        {site.threads && <a className="button button-small" href={site.threads} target="_blank" rel="noopener noreferrer"><Image src="/icons/threads.svg" alt="" width={20} height={20} /> Threads</a>}
        {site.linkedin && <a className="button button-small" href={site.linkedin} target="_blank" rel="noopener noreferrer"><Image src="/icons/linkedin.svg" alt="" width={20} height={20} /> LinkedIn</a>}
        <Link className="button button-small" href="/rss"><RssIcon /> RSS</Link>
      </div>
      {site.supportUrl && <div className="support-callout"><a className="button" href={site.supportUrl} target="_blank" rel="noopener noreferrer"><DollarIcon /><span>{site.supportLabel}</span><span aria-hidden="true">↗</span></a></div>}
      <p className="copyright">© {new Date().getFullYear()}</p>
    </footer>
  );
}
