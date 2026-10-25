'use client';

import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { ArrowUpRight, Check, Database, LockKeyhole, Network, Send } from 'lucide-react';
import { useMotionPreference } from './motion-primitives';

const nodes = [
  { id: 'request', name: 'Request', sub: 'BOOK A SEAT', x: 12, y: 49, icon: Send, detail: 'A booking attempt enters the API. Multiple requests can compete for the same show.' },
  { id: 'api', name: 'Booking API', sub: 'ORCHESTRATOR', x: 43, y: 49, icon: Network, detail: 'The Node.js booking path coordinates lock acquisition and the MongoDB transaction.' },
  { id: 'redis', name: 'Redis', sub: 'SHOW-WIDE LOCK', x: 72, y: 22, icon: LockKeyhole, detail: 'SET NX EX 15 acquires a show-wide lock. Token-checked Lua release protects ownership.' },
  { id: 'mongo', name: 'MongoDB', sub: 'SOURCE OF TRUTH', x: 72, y: 76, icon: Database, detail: 'withTransaction commits allocation changes atomically. The database remains the allocation source of truth.' },
  { id: 'response', name: 'Response', sub: '201 / 409', x: 93, y: 49, icon: Check, detail: 'A committed booking returns 201. An allocation or lock conflict returns an expected 409 in the local benchmark.' },
];

const desktopPath = 'M120 304H430C550 304 552 136 720 136V471C880 471 810 304 930 304';
const mobilePath = 'M72 66H277C277 132 180 132 180 197S72 262 72 328H277';

export function SystemMap() {
  const gradientId = useId();
  const inspectorId = useId();
  const [selected, setSelected] = useState('api');
  const [run, setRun] = useState(0);
  const [travelling, setTravelling] = useState(false);
  const reduced = useMotionPreference();
  const current = nodes.find(node => node.id === selected)!;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 55, damping: 25 });
  const y = useSpring(pointerY, { stiffness: 55, damping: 25 });

  useEffect(() => {
    if (!run) return;
    const timers = nodes.map((node, index) => window.setTimeout(() => setSelected(node.id), reduced ? index * 35 : index * 450));
    timers.push(window.setTimeout(() => setTravelling(false), reduced ? 200 : 2100));
    return () => timers.forEach(window.clearTimeout);
  }, [run, reduced]);

  return <div className="system-environment" onPointerMove={event => {
    if (reduced || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - .5) * 12);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - .5) * 10);
  }} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}>
    <h2 className="sr-only">Explore QuickShow’s booking architecture</h2>
    <div className="system-coordinate mono">QUICKSHOW / INTERACTIVE WALKTHROUGH</div>
    <div className="system-map-help mono"><span className="live-dot" /> SELECT A NODE</div>
    <motion.div className="system-map" style={reduced ? {} : { x, y }}>
      <svg className="system-connections desktop-connections" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id={gradientId}><stop stopColor="#cfff77" stopOpacity=".25" /><stop offset=".5" stopColor="#cfff77" /><stop offset="1" stopColor="#8badd0" stopOpacity=".6" /></linearGradient></defs>
        <circle cx="430" cy="304" r="130" stroke="#bcd59f" fill="none" strokeOpacity=".08" /><circle cx="430" cy="304" r="207" stroke="#bcd59f" fill="none" strokeOpacity=".05" />
        <path d={desktopPath} fill="none" stroke={`url(#${gradientId})`} strokeWidth="1.3" />
        <g fill="#cfff77"><circle cx="268" cy="304" r="3" /><circle cx="577" cy="221" r="3" /><circle cx="720" cy="305" r="3" /></g>
        <g className="system-edge-label"><text x="245" y="280">POST / BOOKING</text><text x="550" y="146">ACQUIRE</text><text x="739" y="320">TRANSACT</text></g>
        {!reduced && travelling && <motion.path key={run} d={desktopPath} fill="none" stroke="#cfff77" strokeWidth="2.5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }} transition={{ duration: 2, ease: 'linear' }} />}
      </svg>
      <svg className="system-connections mobile-connections" viewBox="0 0 360 410" preserveAspectRatio="none" aria-hidden="true">
        <path d={mobilePath} fill="none" stroke="#cfff77" strokeOpacity=".4" strokeWidth="1" />
        {!reduced && travelling && <motion.path key={run} d={mobilePath} fill="none" stroke="#cfff77" strokeWidth="2" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }} transition={{ duration: 2, ease: 'linear' }} />}
      </svg>
      {nodes.map(node => {
        const Icon = node.icon;
        return <button key={node.id} className={`system-node node-${node.id} ${selected === node.id ? 'is-selected' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => setSelected(node.id)} aria-pressed={selected === node.id} aria-controls={inspectorId} aria-label={`Inspect ${node.name}`}>
          <span className="node-orb"><Icon size={node.id === 'api' ? 35 : 24} strokeWidth={1.3} aria-hidden="true" /></span><span className="node-name">{node.name}</span><span className="mono node-sub">{node.sub}</span>
        </button>;
      })}
    </motion.div>
    <div className="system-inspector" id={inspectorId}>
      <span className="mono inspector-index">{String(nodes.findIndex(node => node.id === selected) + 1).padStart(2, '0')} / INSIDE THE SYSTEM</span>
      <AnimatePresence mode="wait" initial={false}><motion.div key={selected} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .12 }}><h3>{current.name}</h3><p>{current.detail}</p></motion.div></AnimatePresence>
    </div>
    <div className="system-send"><button className="send-request" disabled={travelling} onClick={() => { setTravelling(true); setRun(value => value + 1); }}><span>{travelling ? 'Following the request' : 'Simulate booking request'}</span>{travelling ? <span className="request-pulse" /> : <ArrowUpRight size={18} aria-hidden="true" />}</button><span className="simulation-label">QuickShow illustration · No live services</span></div>
    <span className="sr-only" role="status">{travelling ? 'Illustrative request moving through the system.' : run ? 'Request walkthrough complete. Select any node to explore.' : ''}</span>
  </div>;
}
