import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function SiteMark(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <path d="M18 25V12l6 4 6-4v13c0 4-12 4-12 0Z" fill="currentColor" />
      <path d="M6 28c7-2 13-1 18 3 5-4 11-5 18-3v12c-7-2-13-1-18 3-5-4-11-5-18-3V28Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M24 32v10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>;
}

export function RssIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" {...props}><circle cx="5" cy="19" r="1.3" fill="currentColor" stroke="none" /><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /></svg>;
}

export function DollarIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" {...props}><path d="M12 3v18m5-15c-1.2-1-2.8-1.5-5-1.5-3 0-5 1.4-5 3.5s2 3 5 3.5 5 1.4 5 3.5-2 3.5-5 3.5c-2.2 0-4-.6-5-1.5" /></svg>;
}

export function ArrowIcon({ direction = "right", ...props }: IconProps & { direction?: "left" | "right" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={direction === "left" ? "M20 12H4m6-6-6 6 6 6" : "M4 12h16m-6-6 6 6-6 6"} /></svg>;
}
