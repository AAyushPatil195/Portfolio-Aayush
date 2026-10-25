import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { github, linkedin, projects } from '@/lib/projects';
import { publicEmail } from '@/lib/contact';
import { Reveal } from './motion-primitives';
import { ProjectActions } from './project-actions';
import { QuickShowLab } from './quickshow-lab';
import { CapsuleLifecycle, FileAccessDiagram, RetrievalDiagram } from './project-visuals';
import { FieldNote } from './field-note';
import journey from './journey.module.css';
import styles from './journey-chapters.module.css';

function ChapterLabel({ number, children }: { number: string; children: string }) {
  return <p className={`mono ${journey.eyebrow}`}><span /> {number} / {children}</p>;
}

export function JourneyExperience() {
  return <section id="experience" data-journey-chapter className={`${journey.chapter} ${styles.chapter} ${styles.experience}`} aria-labelledby="career-title">
    <ChapterLabel number="03">PROFESSIONAL JOURNEY</ChapterLabel>
    <Reveal className={styles.chapterHeading}><h2 id="career-title">From learning<br />to <span>shipping.</span></h2><p>Interfaces first. Then the systems,<br className={styles.desktopBreak} /> tools, and checks behind them.</p></Reveal>
    <div className={styles.careerGrid}>
      <article className={styles.finixia} aria-labelledby="home-finixia-title"><span className={`mono ${styles.period}`}>JAN — JUN 2025</span><h3 id="home-finixia-title">Finixia Dedecons</h3><p className={styles.role}>Frontend Developer</p><ul><li>Responsive React interfaces and reusable components.</li><li>REST API integration for Wens Force and Melo Films.</li></ul><Link className={styles.detailLink} href="/work#finixia">Inside the work <ArrowUpRight size={16} aria-hidden="true" /></Link><ArrowDownRight className={styles.careerArrow} size={46} strokeWidth={1} aria-hidden="true" /></article>
      <article className={styles.browserstack} aria-labelledby="home-browserstack-title"><span className={`mono ${styles.period}`}>JUN 2025 — APR 2026</span><h3 id="home-browserstack-title">BrowserStack<span>.</span></h3><p className={styles.role}>Software Development Engineer</p><ol className={styles.contributions}>
        <li><span className="mono">01 / BUILD</span><p>Production frontend and backend fixes. AI-assisted agents for PR reviews and Jira updates.</p></li>
        <li><span className="mono">02 / VERIFY</span><p>Missing unit tests, plus <strong>130+</strong> API, UI, and visual regression tests developed.</p></li>
        <li><span className="mono">03 / RELEASE</span><p>CI and release validation with Jenkins and Kubernetes.</p></li>
      </ol><div className={styles.careerEnd}><span className="mono">JAVASCRIPT / NODE.JS / REACT</span><Link className={styles.detailLink} href="/work#browserstack">Explore the contributions <ArrowUpRight size={16} aria-hidden="true" /></Link></div></article>
    </div>
  </section>;
}

export function JourneyProjects() {
  const [quickshow, telecom, capsule, files] = projects;
  return <section id="selected-work" data-journey-chapter className={`${journey.chapter} ${styles.chapter} ${styles.projects}`} aria-labelledby="projects-title">
    <ChapterLabel number="04">THINGS I’VE BUILT</ChapterLabel>
    <Reveal className={styles.chapterHeading}><h2 id="projects-title">Ideas, with<br /><span>working parts.</span></h2><p>Explore the decisions.<br />Try the moving pieces.</p></Reveal>
    <article className={styles.flagship} aria-labelledby="home-quickshow-title"><div className={styles.flagshipHeading}><div><span className={`mono ${styles.projectIndex}`}>01 / FLAGSHIP · CINEMA BOOKING</span><h3 id="home-quickshow-title"><Link href="/work/quickshow">QuickShow<ArrowUpRight aria-hidden="true" /></Link></h3><span className={`mono ${styles.stack}`}>NODE.JS / REDIS / MONGODB</span></div><div className={styles.flagshipSummary}><p>Good systems are built for the moments when everyone clicks at once.</p><ProjectActions project={quickshow} /></div></div><QuickShowLab /><div className={styles.projectFootnote}><span className={styles.sourceStatus}>{quickshow.status}</span><Link href="/work/quickshow#evidence">Architecture, evidence & trade-offs <ArrowRight size={14} aria-hidden="true" /></Link></div></article>
    <article className={`${styles.supporting} ${styles.telecom}`} aria-labelledby="home-telecom-title"><div className={styles.projectStory}><span className={`mono ${styles.projectIndex}`}>02 / APPLIED AI</span><h3 id="home-telecom-title"><Link href="/work/telecom-assistant">Answers start<br />with <span>context.</span></Link></h3><h4>Telecom Support Assistant</h4><p>{telecom.summary}</p><span className={`mono ${styles.stack}`}>PYTHON / LANGCHAIN / CHROMA / GROQ</span><ProjectActions project={telecom} /><span className={styles.sourceStatus}>{telecom.status}</span></div><div className={styles.projectVisual}><RetrievalDiagram /></div></article>
    <article className={`${styles.supporting} ${styles.capsule}`} aria-labelledby="home-capsule-title"><div className={styles.projectStory}><span className={`mono ${styles.projectIndex}`}>03 / BACKEND ENGINEERING</span><h3 id="home-capsule-title"><Link href="/work/time-capsule-api">For the<br /><span>right moment.</span></Link></h3><h4>Time Capsule API</h4><p>{capsule.summary}</p><ProjectActions project={capsule} /><span className={styles.sourceStatus}>{capsule.status}</span></div><div className={styles.projectVisual}><CapsuleLifecycle /></div></article>
    <article className={styles.files} aria-labelledby="home-files-title"><div className={styles.fileIntro}><span className={`mono ${styles.projectIndex}`}>04 / STORAGE & ACCESS</span><h3 id="home-files-title"><Link href="/work/file-manager">File Manager<span>.</span></Link></h3><p>{files.summary}</p><ProjectActions project={files} /><span className={styles.sourceStatus}>{files.status}</span></div><FileAccessDiagram /></article>
  </section>;
}

export function JourneyPersonal() {
  return <>
    <section id="beyond-code" data-journey-chapter className={`${journey.chapter} ${styles.chapter} ${styles.beyond}`} aria-labelledby="beyond-title"><ChapterLabel number="05">BEYOND CODE</ChapterLabel><Reveal className={styles.chapterHeading}><h2 id="beyond-title">A little more<br /><span>human.</span></h2></Reveal><div className={styles.personalGrid}><div className={styles.pitch}><FieldNote /><span className="mono">A DIFFERENT KIND OF PLAYGROUND</span></div><div className={styles.personalStory}><div><span className="mono">OFF THE KEYBOARD</span><h3>State-level<br />football player.</h3></div><p>Technology keeps me curious. I enjoy experimenting with ideas, building products, and working through problems.</p><p className={styles.personalNote}>There’s always something<br />new to figure out.</p></div></div></section>
    <section id="contact" data-journey-chapter className={`${journey.chapter} ${styles.chapter} ${styles.contact}`} aria-labelledby="contact-title"><ChapterLabel number="06">LET’S CONNECT</ChapterLabel><p className={`mono ${styles.endnote}`}>THE LAST CHECKPOINT. A NEW CONVERSATION.</p><Reveal><h2 id="contact-title">Let’s build<br />what’s <span>next.</span></h2></Reveal><div className={styles.contactBottom}><p>For engineering roles, product ideas,<br className={styles.desktopBreak} /> or a thoughtful conversation.</p><nav aria-label="Contact Aayush Patil" className={styles.contactActions}>{publicEmail && <a className={styles.email} href={`mailto:${publicEmail}`}><Mail size={18} aria-hidden="true" /><span>{publicEmail}</span><ArrowUpRight size={18} aria-hidden="true" /></a>}<a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={19} aria-hidden="true" /></a><a href={github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={19} aria-hidden="true" /></a></nav></div><span className={`mono ${styles.closingSignature}`}>AAYUSH PATIL / STILL CURIOUS. STILL BUILDING.</span></section>
  </>;
}
