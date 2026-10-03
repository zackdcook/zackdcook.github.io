import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/content/projects";
import { ProjectCard } from "@/components/project-card";
import { ProgressRings } from "@/components/progress-rings";

export const metadata: Metadata = pageMetadata("writing", "Creative Works");

export default function Writing() {
  return (
    <div className="shell page-wrap">
      <div className="page-intro">
        <p className="eyebrow">Creative Works</p>
        <h1>
          A novel
          <br />
          <em>in the making.</em>
        </h1>
        <p>I’m writing my first novel. Here’s where it stands.</p>
      </div>
      {projects.map(project => <ProjectCard key={project.slug} project={project} />)}
      <section className="writing-panel"><ProgressRings compact /></section>
      <section className="prose section-space">
        <h2>Before the draft</h2>
        <p>{projects[0].beforeDraft}</p>
        <h2>When there’s something to read</h2>
        <p>
          This will also be the home for finished stories, excerpts, and future
          books. For now, the <Link href="/journal">journal</Link> is open.
        </p>
      </section>
    </div>
  );
}
