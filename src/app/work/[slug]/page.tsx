import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { AllocationStudy } from '@/components/allocation-study';
import { ProjectActions } from '@/components/project-actions';
import { CapsuleLifecycle, FileAccessDiagram, RetrievalDiagram } from '@/components/project-visuals';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { getProject, projects } from '@/lib/projects';

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  return { title: project ? `${project.name} — Engineering Case Study` : 'Project not found', description: project?.summary };
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = projects[(projects.findIndex(item => item.slug === slug) + 1) % projects.length];
  return <>
    <SiteHeader caseStudy />
    <main id="main" tabIndex={-1} className={`case-study case-${slug}`}>
      <header className="case-intro"><Link className="back-link" href="/work#selected-work"><ArrowLeft size={17} aria-hidden="true" /> Back to selected work</Link><div className="case-eyebrow mono"><span>{project.index} / ENGINEERING CASE STUDY</span><span>{project.status}</span></div><h1>{project.name}<span>.</span></h1><p className="case-summary">{project.summary}</p><div className="case-stack mono">{project.stack.join(' / ')}</div><ProjectActions project={project} currentPage /></header>
      <div className="case-body">
        <section className="case-text-section" aria-labelledby="case-problem"><span className="mono">01 / THE PROBLEM</span><div><h2 id="case-problem">{slug === 'quickshow' ? 'Correctness under contention.' : slug === 'telecom-assistant' ? 'Context changes the answer.' : slug === 'time-capsule-api' ? 'Time belongs in the access model.' : 'A path is not permission.'}</h2><p>{project.problem}</p></div></section>
        <section className="case-illustration" aria-labelledby="illustration-title"><div><span className="mono">02 / MAKE IT TANGIBLE</span><h2 id="illustration-title">{slug === 'quickshow' ? 'Explore the seat-contention simulation.' : slug === 'telecom-assistant' ? 'Follow the knowledge sources.' : slug === 'time-capsule-api' ? 'Inspect the lifecycle.' : 'Follow the ownership check.'}</h2><p>An explanatory portfolio illustration, separate from the application.</p></div><div className="case-visual">{slug === 'quickshow' ? <AllocationStudy /> : slug === 'telecom-assistant' ? <RetrievalDiagram /> : slug === 'time-capsule-api' ? <CapsuleLifecycle /> : <FileAccessDiagram />}</div></section>
        <section className="case-implementation" aria-labelledby="case-implementation"><span className="mono">03 / IMPLEMENTATION</span><h2 id="case-implementation">The decisions inside the system.</h2><div className="implementation-list">{project.approach.map((item, index) => <article key={item.title}><span className="mono">0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
        <section className="case-text-section case-tradeoffs" aria-labelledby="case-tradeoffs"><span className="mono">04 / TRADE-OFFS</span><div><h2 id="case-tradeoffs">Where the boundaries are.</h2><ul>{project.tradeoffs.map(text => <li key={text}>{text}</li>)}</ul></div></section>
        <section className="case-evidence" id="evidence" aria-labelledby="case-evidence"><span className="mono">05 / EVIDENCE & SOURCE</span><h2 id="case-evidence">Read the implementation.</h2><p>Based on the linked public source, reviewed on 22 October 2026. Descriptions of validation refer to documented checks; no project benchmarks were executed for this portfolio.</p><div className="source-links">{project.evidence.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={18} aria-hidden="true" /></a>)}</div></section>
        <Link className="next-project" href={`/work/${next.slug}`}><span className="mono">NEXT PROJECT</span><span>{next.name}</span><ArrowRight size={28} aria-hidden="true" /></Link>
      </div>
    </main>
    <SiteFooter />
  </>;
}
