import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react';
import { HeroEntrance, NameEntrance, Reveal } from '@/components/motion-primitives';
import { JourneyTrail } from '@/components/journey-trail';
import { FieldNote } from '@/components/field-note';
import { SiteHeader } from '@/components/site-chrome';
import { JourneyExperience, JourneyProjects, JourneyPersonal } from '@/components/journey-chapters';
import styles from '@/components/journey.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Aayush Patil — My Journey' },
  description: 'Meet Aayush Patil, a software engineer focused on backend systems and applied AI. Follow the journey from foundations and college to BrowserStack, engineering projects, and life beyond code.',
};

const milestones = [
  { year: '2019', label: '10th Standard', value: '91', unit: '%', secondary: '', rank: false },
  { year: '2021', label: '12th Standard', value: '93', unit: '%', secondary: '', rank: false },
  { year: '2021', label: 'JEE Main', value: '96', unit: '%ile', secondary: 'Among the top 4%', rank: true },
  { year: '2021', label: 'MHT-CET', value: '99.4', unit: '%ile', secondary: 'Among the top ~0.6%', rank: true },
];

export default function Home() {
  return <>
    <SiteHeader journey />
    <main id="main" tabIndex={-1}>
      <JourneyTrail>
        <section id="introduction" data-journey-chapter className={`${styles.chapter} ${styles.intro}`} aria-labelledby="hero-title">
          <p className={`mono ${styles.eyebrow}`}><span /> 00 / MY JOURNEY <span className={styles.eyebrowAside}>A FEW CHAPTERS. STILL WRITING.</span></p>
          <h1 id="hero-title"><NameEntrance>Aayush Patil<span>.</span></NameEntrance></h1>
          <div className={styles.introGrid}>
            <HeroEntrance delay={.12} className={styles.introStatement}><p>Curiosity,<br /><span>put to work.</span></p><div className={styles.heroActions}><a href="#education" className={styles.primaryAction}>Explore My Journey <ArrowDownRight size={20} aria-hidden="true" /></a><Link href="#selected-work" className={styles.quietAction}>Jump to Work <ArrowUpRight size={16} aria-hidden="true" /></Link></div></HeroEntrance>
            <HeroEntrance delay={.22} className={styles.introStory}><p>I’m a software engineer focused on <strong>backend systems</strong> and <strong>applied AI</strong>.</p><p>I like figuring out how things work, trying ideas, and turning that curiosity into products people can use.</p><span className={`mono ${styles.personalSignature}`}>CURIOUS BY NATURE. ENGINEER AT HEART.</span></HeroEntrance>
          </div>
          <HeroEntrance delay={.3} className={styles.introFootnote}><div><span className="mono">I BUILD SYSTEMS.</span><p>Then make them better.</p></div><FieldNote /></HeroEntrance>
          <a href="#education" className={`mono ${styles.scrollCue}`}>FOLLOW THE THREAD <ArrowDown size={15} aria-hidden="true" /></a>
        </section>

        <section id="education" data-journey-chapter className={`${styles.chapter} ${styles.education}`} aria-labelledby="education-title">
          <p className={`mono ${styles.eyebrow}`}><span /> 01 / FOUNDATIONS <span className={styles.eyebrowAside}>2019 — 2021</span></p>
          <Reveal className={styles.educationHeading}><h2 id="education-title">A solid <span>start.</span></h2></Reveal>
          <dl className={styles.milestones}>
            {milestones.map(item => <Reveal key={item.label} className={`${styles.milestone} ${item.rank ? styles.rank : ''}`}>
              <dt><span className={styles.milestoneMeta}><time className="mono" dateTime={item.year}>{item.year}</time></span><span className={styles.milestoneName}>{item.label}</span></dt><dd><span className={styles.metric} data-unit={item.unit}>{item.value}<span aria-hidden={item.rank ? true : undefined}>{item.unit}</span>{item.rank && <span className="sr-only"> percentile</span>}</span>{item.secondary && <small className={styles.percentileNote}>{item.secondary}</small>}</dd>
            </Reveal>)}
          </dl>
        </section>

        <section id="college" data-journey-chapter className={`${styles.chapter} ${styles.college}`} aria-labelledby="college-title">
          <p className={`mono ${styles.eyebrow}`}><span /> 02 / COLLEGE</p>
          <Reveal className={styles.collegeHeading}><div><span className={`mono ${styles.collegeOverline}`}>INDIAN INSTITUTE OF INFORMATION TECHNOLOGY</span><h2 id="college-title">IIIT Nagpur<span>.</span></h2></div><p className={styles.collegeYears}><time dateTime="2021">2021</time><span>—</span><time dateTime="2025">2025</time></p></Reveal>
          <div className={styles.collegeGrid}>
            <Reveal className={styles.degree}><h3>B.Tech in Computer Science<br />and Engineering</h3><div className={styles.grade}><span>7.6</span><div><span className="mono">CGPA</span><p>out of 10</p></div></div></Reveal>
            <Reveal className={styles.collegeStory}><div className={styles.leadership}><span className="mono">BEYOND THE CLASSROOM</span><h3>Technical-fest leadership.</h3><p>An interest in backend systems and applied AI, with problem-solving as the thread from learning to building.</p></div><details className={styles.collegeDetails}><summary><span>Problem-solving practice</span><Plus size={18} aria-hidden="true" /></summary><div><p className={styles.problemCount}>1,000<span>+</span></p><p>DSA problems solved.</p></div></details></Reveal>
          </div>
        </section>

        <JourneyExperience />
        <JourneyProjects />
        <JourneyPersonal />
      </JourneyTrail>
    </main>
    <footer className={styles.journeyFooter}><Link className={styles.footerWordmark} href="/" aria-label="Aayush Patil ? home">ap<span>.</span></Link><p>Still curious. Still building.</p><nav aria-label="Footer navigation"><Link href="/work">The work, in detail <ArrowUpRight size={14} aria-hidden="true" /></Link><a href="#introduction">Back to top ?</a></nav></footer>
  </>;
}
