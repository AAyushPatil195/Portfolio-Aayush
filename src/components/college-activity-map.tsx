'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { ease, useMotionPreference } from './motion-primitives';
import styles from './college.module.css';

// Exact user-supplied roles. These are thematic groups, not dated stages.
const threads = [
  { id:'community',letter:'C',title:'Community',summary:'Clubs & communities',hint:'The people around the ideas.',entries:[['Probe Club','Media Club member'],['CRISPR','Founding team member'],['DOTSLASH','Club member'],['Udyam E-Cell','Member']] },
  { id:'representation',letter:'R',title:'Representation',summary:'A voice on campus',hint:'Section & EBSB representation.',entries:[['Section Representative',''],['Manipur EBSB Representative','']] },
  { id:'leadership',letter:'L',title:'Leadership',summary:'Sports Secretary',hint:'Sport & campus leadership.',entries:[['Sports Secretary','']] },
  { id:'events',letter:'E',title:'Events & festivals',summary:'Kshitij · Tantra Fiesta · Abhivyakti',hint:'Organization, content & collaboration.',entries:[['Events organized','Kshitij 2023|Kshitij 2024'],['Tantra Fiesta — Technical Festival','Event Management Co-Lead|Content Lead'],['Abhivyakti — Cultural Festival','Content Lead|Corporate/PR Co-Lead']] },
];

type Thread = (typeof threads)[number];

function ActivityFacts({ thread }: { thread: Thread }) {
  return <dl>{thread.entries.map(([name, roles]) => <div key={name}>
    <dt>{name}</dt>
    {roles && <dd>{roles.split('|').map(role => <span key={role}>{role}</span>)}</dd>}
  </div>)}</dl>;
}

export function CollegeActivityMap() {
  const [active, setActive] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useMotionPreference();
  const id = useId();
  const { scrollYProgress } = useScroll({ target: canvas, offset: ['start .85', 'end .45'] });
  const trackOpacity = useTransform(scrollYProgress, [0, 1], [.25, .8]);
  useEffect(() => setEnhanced(true), []);
  useEffect(() => {
    if (!active || window.matchMedia('(min-width:1024px)').matches) return;
    const button = buttons.current[threads.findIndex(thread => thread.id === active)];
    const focusAtSelection = document.activeElement;
    const reducedAtSelection = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    // Closing an earlier inline panel can move the newly selected checkpoint above
    // the viewport. Recover it after the height transition, without fighting scrolling.
    const timer = window.setTimeout(() => {
      if (!button || document.activeElement !== focusAtSelection || window.matchMedia('(min-width:1024px)').matches) return;
      const bounds = button.getBoundingClientRect();
      if (bounds.top < 80 || bounds.bottom > innerHeight - 12) {
        button.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth' });
      }
    }, reducedAtSelection ? 0 : 400);
    const cancel = () => window.clearTimeout(timer);
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchmove', cancel, { passive: true });
    return () => { cancel(); window.removeEventListener('wheel', cancel); window.removeEventListener('touchmove', cancel); };
  }, [active]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowDown' ? (index + 1) % 4
      : event.key === 'ArrowUp' ? (index + 3) % 4
      : event.key === 'Home' ? 0 : event.key === 'End' ? 3 : null;
    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus();
  }

  return <div className={styles.activity} data-enhanced={enhanced}>
    <div className={styles.mapCaption}>
      <span className="mono">FOUR PERSPECTIVES / CAMPUS LIFE</span>
      <span>Select a checkpoint <ArrowUpRight size={14} aria-hidden="true" /></span>
    </div>
    <div ref={canvas} className={styles.canvas} data-college-map data-map-ready={enhanced} data-open-thread={active ?? 'none'}>
      {threads.map((thread, index) => {
        const selected = active === thread.id;
        return <div key={thread.id} className={styles.thread} data-thread={thread.id} data-active={selected} style={{ '--row': index + 1 } as CSSProperties}>
          <h4 className={styles.checkpointHeading}>
            {index < threads.length - 1 && <motion.span className={styles.shortTrack} style={{ opacity: reduced ? .65 : trackOpacity }} aria-hidden="true" />}
            <button ref={element => { buttons.current[index] = element; }} type="button" className={styles.checkpointButton}
              aria-expanded={selected} aria-controls={`${id}-panel-${thread.id}`} id={`${id}-button-${thread.id}`}
              data-college-choice={thread.id} onClick={() => setActive(previous => previous === thread.id ? null : thread.id)}
              onKeyDown={event => navigate(event, index)}>
              <span className={styles.marker} data-college-marker={thread.id} data-college-entry={index === 0 ? 'true' : undefined} aria-hidden="true">{thread.letter}</span>
              <span className={styles.threadWords}><span className={styles.threadTitle}>{thread.title}</span><span className={styles.threadSummaryText}>{thread.summary}</span></span>
              <Plus className={styles.selectIcon} size={16} aria-hidden="true" />
            </button>
          </h4>
          <div className={styles.detailsSlot} id={`${id}-panel-${thread.id}`} data-panel={thread.id} aria-hidden={!selected} inert={!selected} role="region" aria-labelledby={`${id}-button-${thread.id}`}>
            <div className={styles.detailsClip}>
              <motion.div className={styles.detailContent} initial={false}
                animate={enhanced ? { opacity: selected ? 1 : 0, x: selected || reduced ? 0 : 22 } : undefined}
                transition={{ duration: reduced ? 0 : .32, ease }}>
                <div className={styles.panelEyebrow}><span className="mono">{thread.letter} / CAMPUS NOTES</span><span aria-hidden="true">0{index + 1}</span></div>
                <h5>{thread.title}</h5><p className={styles.panelHint}>{thread.hint}</p>
                <ActivityFacts thread={thread} />
              </motion.div>
            </div>
          </div>
        </div>;
      })}
      <div className={styles.emptyPanel} aria-hidden={active !== null} inert={active !== null}>
        <span className="mono">BEYOND THE CLASSROOM</span>
        <p>People. Purpose.<br /><span>Participation.</span></p>
        <span>Choose a checkpoint to explore the communities,<br /> roles, and events that shaped my college journey.</span>
      </div>
    </div>
    <noscript><style>{`.${styles.canvas}{display:none!important}`}</style><div className={styles.fallback}>
      {threads.map(thread => <details key={thread.id} name={`${id}-fallback`}>
        <summary>{thread.title}</summary><p>{thread.hint}</p><ActivityFacts thread={thread} />
      </details>)}
    </div></noscript>
  </div>;
}
