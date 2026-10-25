'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useScroll } from 'motion/react';
import { useMotionPreference } from './motion-primitives';
import styles from './journey.module.css';
import rail from './journey-navigator.module.css';

const chapters = [
  { id: 'introduction', label: 'Introduction', compact: 'Intro' },
  { id: 'education', label: 'Foundations', compact: 'Foundations' },
  { id: 'college', label: 'College', compact: 'College' },
  { id: 'experience', label: 'Professional Journey', compact: 'Career' },
  { id: 'selected-work', label: 'Things I’ve Built', compact: 'Work' },
  { id: 'beyond-code', label: 'Beyond Code', compact: 'Beyond' },
  { id: 'contact', label: 'Contact', compact: 'Contact' },
] as const;
const width = 160, height = 520;
const points = chapters.map((_, i) => ({ x: i % 2 ? 108 : 56, y: 30 + i * 460 / (chapters.length - 1) }));
const pathData = points.reduce((d, b, i) => {
  if (!i) return `M ${b.x} ${b.y}`;
  const a = points[i - 1], gap = b.y - a.y;
  return `${d} C ${a.x} ${a.y + gap * .48}, ${b.x} ${b.y - gap * .48}, ${b.x} ${b.y}`;
}, '');

export function JourneyTrail({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const map = useRef<HTMLElement>(null);
  const connectionId = useId();
  const current = useRef(-1);
  const geometry = useRef({ starts: [] as number[], targets: [] as number[], headings: [] as {x:number;y:number}[], length: 0 });
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const reduced = useMotionPreference();
  const progress = useMotionValue(0);
  const beamX = useMotionValue(points[0].x), beamY = useMotionValue(points[0].y);
  const connection = useMotionValue('M0 0');
  const connectionOpacity = useMotionValue(0);
  const { scrollY } = useScroll();

  const update = useCallback(() => {
    const { starts, targets, headings, length } = geometry.current;
    if (!starts.length || !path.current) return;
    const position = Math.max(0, window.scrollY);
    let next = 0;
    starts.forEach((start, i) => { if (position >= start - 1) next = i; });
    // Tall viewports can give two short chapters the same clamped anchor.
    // At that exact destination, the URL disambiguates direct/history visits.
    const hashIndex = chapters.findIndex(chapter => `#${chapter.id}` === location.hash);
    const atSharedTarget = hashIndex >= 0 && hashIndex !== next && Math.abs(position - targets[hashIndex]) < 2;
    if (atSharedTarget) next = hashIndex;
    if (current.current !== next) { current.current = next; setActive(next); }
    const nextStart = starts[next + 1];
    const fraction = atSharedTarget ? 0 : nextStart === undefined ? 1 : Math.min(1, Math.max(0, (position - starts[next]) / Math.max(1, nextStart - starts[next])));
    // Equal-length alternating S curves give each real chapter one segment.
    // Section measurements affect reading progress, never the rail's size.
    const value = Math.min(1, (next + fraction) / (chapters.length - 1));
    progress.set(value);
    // One viewport-sized connector joins the real chapter to the fixed trail.
    // Heading positions are cached; only the sticky map needs a scroll-time read.
    const destination = headings[next], mapBounds = map.current?.getBoundingClientRect();
    if (destination && mapBounds) {
      const targetY = destination.y-position;
      const compact = innerHeight <= 700;
      const radius = compact ? 4 : innerWidth < 768 ? 15 : 19;
      const startX = mapBounds.left + points[next].x/width*mapBounds.width + radius;
      const startY = mapBounds.top + points[next].y/height*mapBounds.height;
      const gap = destination.x-startX;
      const opacity = gap>8 ? Math.max(0,Math.min(1,(targetY-45)/35,(innerHeight-25-targetY)/45)) : 0;
      connection.set(`M ${startX} ${startY} C ${startX+gap*.48} ${startY}, ${destination.x-gap*.32} ${targetY}, ${destination.x} ${targetY}`);
      connectionOpacity.set(opacity);
    }
    if (!reduced) {
      const point = path.current.getPointAtLength(value * length);
      beamX.set(point.x); beamY.set(point.y);
    }
  }, [reduced, progress, beamX, beamY, connection, connectionOpacity]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0, disposed = false;
    const measure = () => {
      if (disposed) return;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const sections = chapters.map(chapter => element.querySelector<HTMLElement>(`#${chapter.id}`)!);
      const starts = sections.map((section, i) => {
        return i === 0 ? 0 : Math.max(0, Math.min(maxScroll, section.getBoundingClientRect().top + window.scrollY - innerHeight * .3));
      });
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const targets = sections.map(section => Math.max(0, Math.min(maxScroll, section.getBoundingClientRect().top + window.scrollY - padding - (parseFloat(getComputedStyle(section).scrollMarginTop) || 0))));
      const headings = sections.map(section => {
        const entry=section.querySelector<HTMLElement>('[data-college-entry]');
        const marker=entry??section.querySelector<HTMLElement>('[data-journey-heading] > span');
        const bounds=(marker??section).getBoundingClientRect();
        return {x:entry?bounds.left-3:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2+window.scrollY};
      });
      geometry.current = { starts, targets, headings, length: path.current?.getTotalLength() ?? 0 };
      setReady(true);
      update();
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    element.querySelectorAll('[data-journey-chapter]').forEach(section => observer.observe(section));
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    window.addEventListener('popstate', schedule);
    window.addEventListener('pageshow', schedule);
    document.fonts.ready.then(schedule);
    measure();
    return () => {
      disposed = true; observer.disconnect(); cancelAnimationFrame(frame);
      for (const event of ['resize', 'hashchange', 'popstate', 'pageshow']) window.removeEventListener(event, schedule);
    };
  }, [update]);
  useMotionValueEvent(scrollY, 'change', update);

  return <div className={styles.journey} ref={root} data-active-chapter={chapters[active].id} data-trail-ready={ready}>
    <svg className={rail.chapterConnection} data-chapter-connection aria-hidden="true"><defs><linearGradient id={connectionId}><stop stopColor="#cfff77" stopOpacity=".4" /><stop offset="1" stopColor="#8badd0" stopOpacity=".5" /></linearGradient></defs><motion.path key={active} d={connection} style={{opacity:connectionOpacity}} stroke={`url(#${connectionId})`} strokeWidth="1" fill="none" initial={reduced?false:{pathLength:0}} animate={{pathLength:1}} transition={{duration:reduced?0:.65}} /></svg>
    <aside className={rail.bounds} aria-label="Journey progress">
      <div className={rail.navigator} data-journey-navigator data-reduced-motion={reduced} data-enhanced={ready}>
        <p className={rail.railHeading} aria-hidden="true">MY JOURNEY <span>00—06</span></p>
        <nav className={rail.map} aria-label="Journey chapters" ref={map}>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
            <path className={rail.base} d={pathData} ref={path} vectorEffect="non-scaling-stroke" />
            <motion.path className={rail.progress} d={pathData} style={{ pathLength: progress }} vectorEffect="non-scaling-stroke" />
            <motion.circle className={rail.beam} r="2.5" cx="0" cy="0" style={{ x: beamX, y: beamY }} />
            {points.map((point, i) => <circle key={chapters[i].id} className={rail.compactDot} cx={point.x} cy={point.y} r={i === active ? 7 : 4} data-state={!ready ? 'upcoming' : i < active ? 'complete' : i === active ? 'active' : 'upcoming'} />)}
          </svg>
          {chapters.map((chapter, i) => <a key={chapter.id} href={`#${chapter.id}`} className={rail.checkpoint} style={{ top: `${points[i].y / height * 100}%`, left: `${points[i].x / width * 100}%` }} aria-label={`${String(i).padStart(2, '0')} — ${chapter.label}`} title={chapter.label} aria-current={ready && active === i ? 'step' : undefined} data-state={!ready ? 'upcoming' : i < active ? 'complete' : i === active ? 'active' : 'upcoming'}><span className={rail.number}>{String(i).padStart(2, '0')}</span></a>)}
        </nav>
        <select className={rail.chapterPicker} aria-label="Choose journey chapter" value={chapters[active].id} onChange={event => {
          const id = event.currentTarget.value;
          // A native select can cancel hash scrolling when quickly reselected.
          // Keep the browser's scrolling/history APIs, without a second scroll engine.
          if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
          document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
          update();
        }}>
          {chapters.map((chapter, i) => <option key={chapter.id} value={chapter.id}>{String(i).padStart(2, '0')} · {chapter.label}</option>)}
        </select>
        <div className={rail.status} aria-hidden="true"><span>{ready ? `READING / ${String(active).padStart(2, '0')}` : 'CHAPTERS'}</span><p className={rail.fullLabel}>{ready ? chapters[active].label : 'My journey'}</p><p className={rail.compactLabel}>{ready ? chapters[active].compact : 'Chapters'}</p></div>
        <Link className={rail.workShortcut} href="#selected-work" aria-label="Jump to selected work">Work <ArrowUpRight size={13} aria-hidden="true" /></Link>
      </div>
    </aside>
    {children}
  </div>;
}
