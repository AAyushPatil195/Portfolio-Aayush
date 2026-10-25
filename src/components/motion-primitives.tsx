'use client';

import { useRef, useSyncExternalStore, type ReactNode } from 'react';
import { MotionConfig, motion, useScroll, useTransform } from 'motion/react';

export const ease = [0.22, 1, 0.36, 1] as const;

const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeToMotionPreference(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const getMotionPreference = () => window.matchMedia(motionQuery).matches;
const getServerMotionPreference = () => false;

export function useMotionPreference() {
  return useSyncExternalStore(subscribeToMotionPreference, getMotionPreference, getServerMotionPreference);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function NameEntrance({ children }: { children: ReactNode }) {
  return <motion.span className="name-entrance" initial={{ y: 14 }} animate={{ y: 0 }} transition={{ duration: .85, ease }}>{children}</motion.span>;
}

export function HeroEntrance({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.div className={`hero-entrance ${className}`} initial={{ y: 16 }} animate={{ y: 0 }} transition={{ duration: .8, delay, ease }}>{children}</motion.div>;
}

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.div className={`section-reveal ${className}`} initial={{ y: 24 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .8, ease }}>{children}</motion.div>;
}

export function ProjectPlate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start center'] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 0]);
  return <motion.div className="playground-project" ref={ref} style={reduced ? {} : { rotate }}>{children}</motion.div>;
}
