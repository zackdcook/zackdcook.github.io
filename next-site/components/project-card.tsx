"use client";

import Link from "next/link";
import { OrganicTransition } from "@/components/organic-transition";
import { useState } from "react";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(true);
  return <OrganicTransition name={`project-${project.slug}`}><article className="writing-panel project-card">
    <div><p className="eyebrow">{project.category} · {project.status}</p><h2>{project.title}</h2>
      <p>{project.summary}</p>
      <button className="project-description-toggle" aria-expanded={expanded} aria-controls={`details-${project.slug}`} onClick={() => setExpanded(!expanded)}>{expanded ? "Fewer deets" : "A few more deets"}</button>
      <div id={`details-${project.slug}`} className="project-description" hidden={!expanded}>{project.description.map(p => <p key={p}>{p}</p>)}</div>
      <div className="actions"><Link className="button" href={`/writing/${project.slug}`} prefetch>Open the project</Link></div>
    </div>
  </article></OrganicTransition>;
}
