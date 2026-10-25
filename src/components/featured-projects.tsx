import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { benchmarkSource, projects } from '@/lib/projects';
import { AllocationStudy } from './allocation-study';
import { ProjectPlate, Reveal } from './motion-primitives';
import { ProjectActions } from './project-actions';
import { CapsuleLifecycle, FileAccessDiagram, RetrievalDiagram } from './project-visuals';

function ProjectStatus({ name, status }: { name: string; status: string }) {
  return <span className="project-status" aria-label={`${name}: ${status}`}><span aria-hidden="true" />{status}</span>;
}

export function FeaturedProjects() {
  const [quickshow, telecom, capsule, files] = projects;
  return <>
    <section className="playground-work" id="selected-work" aria-labelledby="quickshow-title">
      <div className="section-kicker mono"><span>01 / FROM ARCHITECTURE TO EXPERIENCE</span><span>SELECTED WORK</span></div>
      <div className="playground-project-heading">
        <Reveal><span className="mono project-category">{quickshow.category}</span><h2 id="quickshow-title"><Link href="/work/quickshow">QuickShow<ArrowRight aria-hidden="true" /></Link></h2><div className="project-meta"><span className="mono">NODE.JS / REDIS / MONGODB</span><ProjectStatus name={quickshow.name} status={quickshow.status} /></div></Reveal>
        <Reveal className="quickshow-summary"><p>Good systems are built for the moments when everyone clicks at once.</p><ProjectActions project={quickshow} /><a className="simulation-entry" href="#quickshow-simulation">Try seat simulation <ArrowDownRight size={18} aria-hidden="true" /></a></Reveal>
      </div>
      <div id="quickshow-simulation" className="simulation-anchor"><ProjectPlate><div className="playground-project-caption"><span className="mono">THE BOOKING LAB / INTERACTIVE SIMULATION</span><h3>One seat.<br />Two requests.<br /><span>One decision.</span></h3><p>Explore a same-seat conflict. A show-wide lock coordinates entry; MongoDB decides what commits.</p><span className="simulation-scope"><ShieldCheck size={16} aria-hidden="true" /> A local illustration, separate from the application.</span></div><AllocationStudy /></ProjectPlate></div>
      <div className="evidence-note"><ShieldCheck size={17} aria-hidden="true" /><p>Architecture follows the <a href={benchmarkSource} target="_blank" rel="noopener noreferrer">benchmarking branch</a>. Local smoke checks are documented; no high-load performance result is claimed. <Link href="/work/quickshow#evidence">Read the evidence <ArrowRight size={13} aria-hidden="true" /></Link></p></div>
    </section>

    <section className="telecom-section project-section" id="telecom-assistant" aria-labelledby="telecom-title">
      <div className="section-kicker mono"><span>02 / KNOWLEDGE INTO CONTEXT</span><span>APPLIED AI</span></div>
      <div className="project-split telecom-split">
        <Reveal className="project-story"><span className="mono project-category">RETRIEVAL / GROUNDING / SUPPORT</span><h2 id="telecom-title"><Link href="/work/telecom-assistant">Better answers.<br /><span>Start with context.</span></Link></h2><h3>Telecom Support Assistant</h3><p>{telecom.summary}</p><p className="project-point">Three knowledge sources. One retrieval path. An explicit boundary when the context falls short.</p><span className="project-stack mono">PYTHON / LANGCHAIN / CHROMA / GROQ</span><ProjectStatus name={telecom.name} status={telecom.status} /><ProjectActions project={telecom} /></Reveal>
        <Reveal className="project-visual"><RetrievalDiagram /></Reveal>
      </div>
    </section>

    <section className="capsule-section project-section" id="time-capsule-api" aria-labelledby="capsule-title">
      <div className="section-kicker mono"><span>03 / PERMISSION HAS A TIMELINE</span><span>BACKEND ENGINEERING</span></div>
      <div className="project-split capsule-split">
        <Reveal className="project-visual"><CapsuleLifecycle /></Reveal>
        <Reveal className="project-story"><span className="mono project-category">ACCESS CONTROL / LIFECYCLE DESIGN</span><h2 id="capsule-title"><Link href="/work/time-capsule-api">For the right<br /><span>moment.</span></Link></h2><h3>Time Capsule API</h3><p>{capsule.summary}</p><p className="project-point">The authenticated owner, the right code, and the right time all belong in the read path.</p><span className="project-stack mono">NODE.JS / SQLITE / JWT / JEST</span><ProjectStatus name={capsule.name} status={capsule.status} /><ProjectActions project={capsule} /></Reveal>
      </div>
    </section>

    <section className="file-section project-section" id="file-manager" aria-labelledby="file-title">
      <div className="section-kicker mono"><span>04 / ALSO IN THE TOOLBOX</span><span>STORAGE & ACCESS</span></div>
      <div className="file-project"><div className="file-story"><span className="mono project-category">EXPRESS / FIREBASE STORAGE / JWT</span><h2 id="file-title"><Link href="/work/file-manager">Your files.<br /><span>Your access.</span></Link></h2><h3>File Manager</h3><p>{files.summary}</p><ProjectStatus name={files.name} status={files.status} /><ProjectActions project={files} /></div><FileAccessDiagram /></div>
    </section>
  </>;
}
