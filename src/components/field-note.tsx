'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useMotionPreference } from './motion-primitives';
import styles from './journey.module.css';

export function FieldNote() {
  const reduced = useMotionPreference();
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 90, damping: 24 });
  const y = useSpring(pointerY, { stiffness: 90, damping: 24 });
  return <div className={styles.fieldNote} onPointerMove={event => {
    if (reduced || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left - bounds.width / 2) * .025);
    pointerY.set((event.clientY - bounds.top - bounds.height / 2) * .04);
  }} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}>
    <svg viewBox="0 0 160 90" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth=".8"><path d="M1 1H159V89H1Z M80 1V89 M1 22H24V68H1 M159 22H136V68H159" /><circle cx="80" cy="45" r="24" /></g><motion.g style={reduced ? {} : { x, y }} className={styles.fieldBall}><circle cx="94" cy="39" r="10" fill="currentColor" /><path d="m94 34 5 4-2 6h-6l-2-6Z" stroke="#10141a" strokeWidth=".8" /></motion.g></svg>
    <div><span className="mono">OFF THE KEYBOARD</span><p>State-level<br />football player.</p></div>
  </div>;
}
