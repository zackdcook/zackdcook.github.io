import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, projects } from "@/content/projects";
import { pageMetadata } from "@/lib/page-metadata";
import { OrganicTransition } from "@/components/organic-transition";
import { ProgressRings } from "@/components/progress-rings";

export function generateStaticParams() { return projects.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return pageMetadata(`project-${slug}`, project.title);
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <div className="shell page-wrap">
    <Link className="button button-small" href="/writing">Creative Works</Link>
    <OrganicTransition name={`project-${project.slug}`}><section className="writing-panel project-detail-surface">
      <div className="page-intro"><p className="eyebrow">{project.category} · {project.status}</p><h1>{project.title}</h1><p>{project.summary}</p>{project.description.map(p => <p key={p}>{p}</p>)}</div>
      <ProgressRings compact />
    </section></OrganicTransition>
    <div className="prose section-space"><h2>Before the draft</h2><p>{project.beforeDraft}</p></div>
  </div>;
}
