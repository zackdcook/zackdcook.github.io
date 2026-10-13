import Link from "next/link";
import { site } from "@/content/site";
import { DollarIcon, GoodreadsIcon, InstagramIcon, LinkedInIcon, MailIcon, RssIcon, SpotifyIcon, ThreadsIcon } from "@/components/icons";
import { CopyrightNote } from "@/components/copyright-note";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner shell">
        <div className="footer-links">
          <a className="text-link button-small" href={`mailto:${site.email}`}>
            <MailIcon /> Say hello
          </a>
          {site.instagram && <a className="text-link button-small" href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /> Instagram</a>}
          <a className="text-link button-small" href="https://www.goodreads.com/user/show/27092266" target="_blank" rel="noopener noreferrer"><GoodreadsIcon /> Goodreads</a>
          <a className="text-link button-small" href="https://open.spotify.com/user/1268979610" target="_blank" rel="noopener noreferrer"><SpotifyIcon /> Spotify</a>
          {site.linkedin && <a className="text-link button-small" href={site.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /> LinkedIn</a>}
          {site.threads && <a className="text-link button-small" href={site.threads} target="_blank" rel="noopener noreferrer"><ThreadsIcon /> Threads</a>}
          <Link className="text-link button-small" href="/rss"><RssIcon /> RSS</Link>
        </div>
        {site.supportUrl && <div className="support-callout"><a className="button" href={site.supportUrl} target="_blank" rel="noopener noreferrer"><DollarIcon /><span>{site.supportLabel}</span></a></div>}
        <div className="footer-colophon"><CopyrightNote startYear={2023} year={2026} name={site.name} /><Link className="footer-privacy" href="/privacy">Privacy</Link></div>
      </div>
    </footer>
  );
}
