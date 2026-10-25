import Link from 'next/link';
import { ArrowRight, ArrowUpRight, GitBranch } from 'lucide-react';
import type { Project } from '@/lib/projects';

export function ProjectActions({ project, currentPage = false }: { project: Project; currentPage?: boolean }) {
  return (
    <nav className="project-actions" aria-label={`${project.name} project actions`}>
      {!currentPage && <Link className="project-action action-primary" href={`/work/${project.slug}`} aria-label={`${project.name}: Case Study`}>Case Study <ArrowRight size={17} aria-hidden="true" /></Link>}
      {project.liveDemo?.kind === 'frontend' && <a className="project-action action-demo" href={project.liveDemo.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.name}: Live Demo (opens in a new tab)`}>Live Demo <ArrowUpRight size={17} aria-hidden="true" /></a>}
      <a className="project-action action-source" href={project.repository} target="_blank" rel="noopener noreferrer" aria-label={`${project.name}: GitHub (opens in a new tab)`}><GitBranch size={16} aria-hidden="true" /> GitHub <ArrowUpRight size={15} aria-hidden="true" /></a>
    </nav>
  );
}
