'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Plus } from 'lucide-react';
import { useMotionPreference } from './motion-primitives';
import styles from './professional-journey.module.css';

const contributions = [
  { label: 'BUILD', title: 'Fix the product. Improve the workflow.', summary: 'Production frontend and backend fixes. AI-assisted agents for PR reviews and Jira updates.', detail: 'Investigated 17 RBAC permission defects and 25+ additional bugs; supported product features including RBAC and reporting workflows.', tools: 'JavaScript / Node.js / React' },
  { label: 'VERIFY', title: 'Make confidence part of the code.', summary: 'Missing unit tests, plus 130+ API, UI, and visual regression tests developed.', detail: 'Added missing frontend and backend unit tests, alongside API, UI, and visual regression coverage.', tools: 'Jest / PactumJS / NightwatchJS / Percy' },
  { label: 'RELEASE', title: 'Follow the work into release.', summary: 'CI and release validation with Jenkins and Kubernetes.', detail: 'Supported CI and release validation across the engineering workflow.', tools: 'Jenkins / Kubernetes' },
];

export function ProfessionalContributions() {
  const [selected, setSelected] = useState<number | null>(null);
  const reduced = useMotionPreference();
  const id = useId();
  return <div className={styles.workbench}>
    <div className={styles.workbenchHeading}><span className="mono">THREE SIDES OF THE WORK</span><span className="mono">SELECT TO EXPLORE <ArrowRight size={12} aria-hidden="true" /></span></div>
    <ol className={styles.contributions}>{contributions.map((item, i) => <li key={item.label} data-open={selected === i}>
      <button className={styles.contributionButton} aria-expanded={selected === i} aria-controls={`${id}-${i}`} onClick={() => setSelected(selected === i ? null : i)}><span className={styles.step}><span className="mono">0{i + 1}</span><span>{item.label}</span></span><span className={styles.contributionCopy}><strong>{item.title}</strong><span>{item.summary}</span></span><Plus className={styles.plus} size={20} aria-hidden="true" /></button>
      <div id={`${id}-${i}`}><AnimatePresence initial={false}>{selected === i && <motion.div className={styles.expanded} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: reduced ? 0 : .25, ease: [.22,1,.36,1] }}><div><p>{item.detail}</p><span className="mono">{item.tools}</span></div></motion.div>}</AnimatePresence></div>
    </li>)}</ol>
  </div>;
}
