'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, ArrowRight, BookOpen, Check, Clock3, Database, FileText, KeyRound, LockKeyhole, MessageSquare, UnlockKeyhole } from 'lucide-react';
import { useMotionPreference } from './motion-primitives';

const sources = [
  { name: 'FAQs', key: 'FAQ', icon: MessageSquare, label: 'Policy & how-to', body: 'One FAQ per document. General policies and how-to information enter the shared context.' },
  { name: 'Tickets', key: 'TICKETS', icon: Database, label: 'Resolved cases', body: 'Resolved support tickets contribute prior resolutions from their own Chroma collection.' },
  { name: 'PDF guides', key: 'GUIDES', icon: BookOpen, label: 'Guide passages', body: 'Chunked PDF documentation provides guide passages alongside the FAQ and ticket results.' },
];

export function RetrievalDiagram() {
  const [selected, setSelected] = useState(0);
  const panelId = useId();
  const reduced = useMotionPreference();
  const source = sources[selected];
  return <div className="retrieval-diagram">
    <div className="visual-topline mono"><span>RETRIEVAL BEFORE GENERATION</span><span>RAG / 01</span></div>
    <div className="rag-question"><MessageSquare size={19} strokeWidth={1.4} aria-hidden="true" /><div><span className="mono">EXAMPLE QUESTION</span><p>How do I activate international roaming?</p></div></div>
    <div className="retrieval-connector" aria-hidden="true"><span /><ArrowDown size={18} /></div>
    <div className="rag-sources" role="group" aria-label="Explore the assistant’s knowledge sources">
      {sources.map((item, index) => { const Icon = item.icon; return <button key={item.key} onClick={() => setSelected(index)} aria-pressed={selected === index} aria-controls={panelId}><Icon size={24} strokeWidth={1.25} aria-hidden="true" /><span>{item.name}</span><small>{item.label}</small></button>; })}
    </div>
    <div className="rag-context" id={panelId}><span className="mono">{source.key} → MERGED CONTEXT</span><AnimatePresence mode="wait" initial={false}><motion.p key={selected} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .12 }}>{source.body}</motion.p></AnimatePresence></div>
    <div className="rag-output"><span><Check size={16} aria-hidden="true" /> Context first. Answer second.</span><ArrowRight size={18} aria-hidden="true" /></div>
    <p className="visual-disclaimer">Interactive architecture illustration. No model call or generated answer.</p>
  </div>;
}

const phases = [
  { name: 'Create', icon: FileText, code: '201', status: 'CREATED', title: 'A message for later.', body: 'A future unlock time and a generated code establish the capsule’s lifecycle.' },
  { name: 'Lock', icon: LockKeyhole, code: '403', status: 'TOO EARLY', title: 'Timing is part of access.', body: 'Before unlock_at, an individual read is rejected—even with the right owner and code.' },
  { name: 'Unlock', icon: UnlockKeyhole, code: '200', status: 'AVAILABLE', title: 'The right time. The right owner.', body: 'After unlock_at, the authenticated owner and valid unlock code can access the message.' },
  { name: 'Expire', icon: Clock3, code: '410', status: 'EXPIRED', title: 'Nothing lasts forever.', body: 'Thirty days after unlock, the individual read path treats the capsule as expired.' },
];

export function CapsuleLifecycle() {
  const [selected, setSelected] = useState(1);
  const panelId = useId();
  const reduced = useMotionPreference();
  const phase = phases[selected];
  const Icon = phase.icon;
  return <div className="capsule-lifecycle">
    <div className="visual-topline mono"><span>TIME AS AN ACCESS RULE</span><span>LIFECYCLE / 04</span></div>
    <div className="capsule-phase" id={panelId}>
      <div className="capsule-symbol"><Icon size={38} strokeWidth={1.15} aria-hidden="true" /><span className="capsule-orbit" /></div>
      <div className="capsule-response mono"><span>{phase.code}</span> / {phase.status}</div>
      <AnimatePresence mode="wait" initial={false}><motion.div key={selected} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .12 }}><p className="phase-title">{phase.title}</p><p>{phase.body}</p></motion.div></AnimatePresence>
    </div>
    <div className="lifecycle-steps" role="group" aria-label="Explore the capsule lifecycle">{phases.map((item, index) => <button key={item.name} aria-pressed={selected === index} aria-controls={panelId} onClick={() => setSelected(index)}><span className="step-dot">{String(index + 1).padStart(2, '0')}</span><span>{item.name}</span></button>)}</div>
    <p className="visual-disclaimer">Illustrative states · Select a stage to inspect its access rule.</p>
  </div>;
}

export function FileAccessDiagram() {
  return <div className="file-access-diagram" role="img" aria-label="File download access flow: verify the authenticated owner, look up the matching file, then issue a short-lived signed URL.">
    <span className="mono">OWNERSHIP BEFORE ACCESS</span><div className="access-flow"><div><KeyRound size={24} strokeWidth={1.3} aria-hidden="true" /><span>Owner</span></div><ArrowRight size={20} aria-hidden="true" /><div><FileText size={24} strokeWidth={1.3} aria-hidden="true" /><span>File</span></div><ArrowRight size={20} aria-hidden="true" /><div><LockKeyhole size={24} strokeWidth={1.3} aria-hidden="true" /><span>Signed URL</span></div></div><span className="access-caption">User-scoped lookup → temporary storage access</span>
  </div>;
}
