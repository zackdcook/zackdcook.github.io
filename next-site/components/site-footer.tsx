import Link from "next/link";
import { site } from "@/content/site";
import { DollarIcon, InstagramIcon, LinkedInIcon, MailIcon, RssIcon, ThreadsIcon } from "@/components/icons";
import { CopyrightNote } from "@/components/copyright-note";
import { PreferencesButton } from "@/components/preferences-button";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <div className="footer-links">
        <a className="button button-small" href={`mailto:${site.email}`}>
          <MailIcon /> Say hello
        </a>
        {site.instagram && <a className="button button-small" href={site.instagram} target="_blank" rel="noopener noreferrer"><InstagramIcon /> Instagram</a>}
        {site.threads && <a className="button button-small" href={site.threads} target="_blank" rel="noopener noreferrer"><ThreadsIcon /> Threads</a>}
        {site.linkedin && <a className="button button-small" href={site.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /> LinkedIn</a>}
        <Link className="button button-small" href="/rss"><RssIcon /> RSS</Link>
      </div>
      {site.supportUrl && <div className="support-callout"><a className="button" href={site.supportUrl} target="_blank" rel="noopener noreferrer"><DollarIcon /><span>{site.supportLabel}</span></a></div>}
      <PreferencesButton />
      <CopyrightNote startYear={2023} year={2026} name={site.name} />
    </footer>
  );
}
