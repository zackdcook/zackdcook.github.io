import Link from "next/link";
import { site } from "@/content/site";
import { DollarIcon, MailIcon, RssIcon } from "@/components/icons";
import { CopyrightNote } from "@/components/copyright-note";
import { PreferencesButton } from "@/components/preferences-button";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <div className="footer-links">
        <a className="button button-small" href={`mailto:${site.email}`}>
          <MailIcon /> Say hello
        </a>
        {site.instagram && <a className="button button-small" href={site.instagram} target="_blank" rel="noopener noreferrer"><span className="social-icon social-icon-instagram" aria-hidden="true" /> Instagram</a>}
        {site.threads && <a className="button button-small" href={site.threads} target="_blank" rel="noopener noreferrer"><span className="social-icon social-icon-threads" aria-hidden="true" /> Threads</a>}
        {site.linkedin && <a className="button button-small" href={site.linkedin} target="_blank" rel="noopener noreferrer"><span className="social-icon social-icon-linkedin" aria-hidden="true" /> LinkedIn</a>}
        <Link className="button button-small" href="/rss"><RssIcon /> RSS</Link>
      </div>
      {site.supportUrl && <div className="support-callout"><a className="button" href={site.supportUrl} target="_blank" rel="noopener noreferrer"><DollarIcon /><span>{site.supportLabel}</span></a></div>}
      <PreferencesButton />
      <CopyrightNote year={2026} name={site.name} />
    </footer>
  );
}
