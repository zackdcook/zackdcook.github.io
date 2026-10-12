import Link from "next/link";
import { site } from "@/content/site";
import { DollarIcon, InstagramIcon, LinkedInIcon, MailIcon, RssIcon, ThreadsIcon } from "@/components/icons";
import { CopyrightNote } from "@/components/copyright-note";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner shell">
        <div className="footer-links">
          <a className="text-link button-small" href={`mailto:${site.email}`}>
            <MailIcon /> Say hello
          </a>
          {site.instagram && <a className="text-link button-small" href={site.instagram} target="_blank" rel="noopener noreferrer"><InstagramIcon /> Instagram</a>}
          {site.threads && <a className="text-link button-small" href={site.threads} target="_blank" rel="noopener noreferrer"><ThreadsIcon /> Threads</a>}
          {site.linkedin && <a className="text-link button-small" href={site.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /> LinkedIn</a>}
          <Link className="text-link button-small" href="/rss"><RssIcon /> RSS</Link>
        </div>
        {site.supportUrl && <div className="support-callout"><a className="button" href={site.supportUrl} target="_blank" rel="noopener noreferrer"><DollarIcon /><span>{site.supportLabel}</span></a></div>}
        <Link className="button footer-privacy" href="/privacy">Privacy</Link>
        <CopyrightNote startYear={2023} year={2026} name={site.name} />
      </div>
    </footer>
  );
}
