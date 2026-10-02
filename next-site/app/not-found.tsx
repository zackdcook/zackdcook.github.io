import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell page-wrap page-intro">
      <p className="eyebrow">404</p>
      <h1>
        A wrong
        <br />
        <em>turn.</em>
      </h1>
      <p>The page you’re looking for isn’t here.</p>
      <Link className="button" href="/">
        Back home
      </Link>
    </div>
  );
}
