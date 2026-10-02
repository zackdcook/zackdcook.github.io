"use client";

import Link from "next/link";
import { OrganicTransition } from "@/components/organic-transition";
import { usePreferences } from "@/components/site-preferences";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  const { preferences, update } = usePreferences();
  return <OrganicTransition name={`project-${project.slug}`}><article className="writing-panel project-card">
    <div><p className="eyebrow">{project.category} · {project.status}</p><h2>{project.title}</h2>
      <p>{project.summary}</p>
      <button className="project-description-toggle" aria-expanded={preferences.expandedProjects} aria-controls={`details-${project.slug}`} onClick={() => update({ expandedProjects: !preferences.expandedProjects })}>{preferences.expandedProjects ? "Fewer deets" : "A few more deets"}</button>
      <div id={`details-${project.slug}`} className="project-description" hidden={!preferences.expandedProjects}>{project.description.map(p => <p key={p}>{p}</p>)}</div>
      <div className="actions"><Link className="button" href={`/writing/${project.slug}`} prefetch>Open the project</Link></div>
    </div>
  </article></OrganicTransition>;
}
