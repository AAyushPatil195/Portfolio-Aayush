import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Download } from 'lucide-react';
import { github, linkedin, resume } from '@/lib/projects';

export function SiteHeader({ caseStudy = false, journey = false }: { caseStudy?: boolean; journey?: boolean }) {
  return <header className="site-header">
    <Link href="/" className="wordmark" aria-label="Aayush Patil — home">ap<span>.</span></Link>
    <span className="header-caption mono">Independent thinking.<br />Considered engineering.</span>
    <nav aria-label="Main navigation">
      {journey ? <><Link href="#education" className="nav-work">The journey <span className="nav-dot" /></Link><Link href="#selected-work" className="nav-experience">Selected work</Link></> : <><Link href={caseStudy ? '/work#selected-work' : '#selected-work'} className="nav-work">Selected work <span className="nav-dot" /></Link><Link href={caseStudy ? '/work#experience' : '#experience'} className="nav-experience">Experience</Link></>}
      <Link href={caseStudy ? '/work#contact' : '#contact'} className="talk-link">Contact <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </nav>
  </header>;
}

export function ResumeAction({ label = 'Download résumé' }: { label?: string }) {
  if (!resume) return null;
  return <a className="resume-action" href={resume.href} download={resume.filename}>{label} <Download size={16} aria-hidden="true" /></a>;
}

export function WorkLink() {
  return <a href="#selected-work" className="work-link"><span>Explore My Work</span><span className="round-arrow"><ArrowDownRight size={23} aria-hidden="true" /></span></a>;
}

export function SiteFooter() {
  return <footer className="site-footer" id="contact">
    <div><span className="mono">HAVE A SYSTEM IN MIND?</span><h2>Let’s talk it through<span>.</span></h2></div>
    <div className="footer-links"><a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={19} aria-hidden="true" /></a><a href={github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={19} aria-hidden="true" /></a><ResumeAction /></div>
    <div className="footer-bottom"><span>Aayush Patil / Software Engineer</span><span className="mono">BUILT WITH INTENTION · 2026</span><Link href="#main">Back to top ↑</Link></div>
  </footer>;
}
