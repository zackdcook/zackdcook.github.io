import records from "./projects.json";
export type Project = typeof records[number];
export const projects: Project[] = records;
export function getProject(slug: string) { return projects.find(project => project.slug === slug); }
