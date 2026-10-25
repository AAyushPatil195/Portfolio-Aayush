'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useMotionPreference } from '@/components/motion-primitives';
import styles from './work-experience.module.css';

const stages = [
  { id: 'diagnose', label: 'Diagnose', detail: 'UI & backend defects' },
  { id: 'build', label: 'Build', detail: 'Features & AI agents' },
  { id: 'verify', label: 'Verify', detail: 'Unit & regression tests' },
  { id: 'release', label: 'Release', detail: 'CI & release validation' },
] as const;

/** A reading map of contribution areas, not a measured delivery pipeline. */
export function ExperienceLoop({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLElement[]>([]);
  const currentStage = useRef('diagnose');
  const [active, setActive] = useState('diagnose');
  const reduced = useMotionPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 35%', 'end 70%'] });

  const updateStage = useCallback(() => {
    // Four geometry reads; React updates only when the reading stage changes.
    // Choosing the last heading above the reading line also handles reverse
    // scrolling and anchor jumps, including gaps between contribution rows.
    let next = 'diagnose';
    for (const row of rows.current) {
      if (row.getBoundingClientRect().top <= window.innerHeight * .4) next = row.dataset.contribution!;
    }
    if (next !== currentStage.current) {
      currentStage.current = next;
      setActive(next);
    }
  }, []);

  useEffect(() => {
    rows.current = Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-contribution]') ?? []);
    updateStage();
    window.addEventListener('resize', updateStage);
    return () => window.removeEventListener('resize', updateStage);
  }, [updateStage]);
  useMotionValueEvent(scrollYProgress, 'change', updateStage);

  return <div ref={ref} className={styles.experienceBody} data-active={active}>
    <aside className={styles.loopAside} aria-label="BrowserStack contribution map">
      <div className={styles.loopSticky}>
        <p className={`mono ${styles.loopEyebrow}`}><span className={styles.signal} /> THE ENGINEERING LOOP</p>
        <p className={styles.loopIntro}>Different contributions.<br /> One delivery cycle.</p>
        <nav className={styles.loopMap} aria-label="Explore BrowserStack contributions">
          <svg viewBox="0 0 340 240" preserveAspectRatio="none" className={styles.loopTrace} aria-hidden="true"><path d="M70 26 H254 Q270 26 270 42 V160 Q270 176 254 176 H70" /><motion.path className={styles.traceProgress} d="M70 26 H254 Q270 26 270 42 V160 Q270 176 254 176 H70" style={reduced ? {} : { pathLength: scrollYProgress }} /></svg>
          {stages.map((stage, index) => <a key={stage.id} href={`#experience-${stage.id}`} className={`${styles.loopNode} ${styles[stage.id]}`} aria-current={active === stage.id ? 'step' : undefined}>
            <span className={styles.nodeNumber}>{String(index + 1).padStart(2, '0')}</span><span className={styles.nodeLabel}>{stage.label}</span><span className={styles.nodeDetail}>{stage.detail}</span>
          </a>)}
        </nav>
        <p className={styles.mapNote}>Follow the contributions <span aria-hidden="true">↗</span><br /><span>Scroll to explore, or choose a stage.</span></p>
      </div>
    </aside>
    {children}
  </div>;
}
