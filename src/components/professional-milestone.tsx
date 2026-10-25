'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useMotionPreference } from './motion-primitives';
import styles from './professional-journey.module.css';

export function ProfessionalMilestone({ number, company, children, last = false }: {
  number: string; company: string; children: ReactNode; last?: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reduced = useMotionPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start .8', 'end .5'] });
  const borderColor = useTransform(scrollYProgress, [0, 1], ['#8badd05c', '#cfff77']);
  const color = useTransform(scrollYProgress, [0, 1], ['#9eb5c1', '#cfff77']);
  return <li ref={ref} className={styles.milestone} data-company-milestone={company}>
    <div className={styles.milestoneRail} aria-hidden="true">
      <motion.span className={styles.milestoneNumber} style={reduced ? {} : { borderColor, color }}>{number}</motion.span>
      {!last && <span className={styles.milestoneTrack}><motion.span style={{ scaleY: reduced ? 1 : scrollYProgress }} /></span>}
    </div>
    {children}
  </li>;
}
