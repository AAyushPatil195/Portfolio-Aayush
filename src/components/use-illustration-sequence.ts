'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from './motion-primitives';

// Finite, explicitly started illustrations. Never run when offscreen or hidden.
export function useIllustrationSequence(initial: number, duration: number) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const [step, setStep] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!playing) return;
    if (reduced || document.hidden) { setPlaying(false); return; }
    const timer = window.setTimeout(() => {
      if (step < 3) setStep(step + 1);
      if (step >= 2) setPlaying(false);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [playing, step, reduced, duration]);
  useEffect(() => {
    const pause = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', pause);
    const element = ref.current;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting || !element) return;
      // Ignore a stale initial observer entry after a rapid scroll-and-play.
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) setPlaying(false);
    });
    if (element) observer.observe(element);
    return () => { document.removeEventListener('visibilitychange', pause); observer.disconnect(); };
  }, []);
  const select = (next: number) => { setPlaying(false); setStep(next); };
  const toggle = () => {
    if (reduced) { select((step + 1) % 4); return; }
    if (playing) { setPlaying(false); return; }
    if (step === 3 || run === 0) { setStep(0); setRun(value => value + 1); }
    setPlaying(true);
  };
  return { ref, step, playing, reduced, select, toggle, run };
}
