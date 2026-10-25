'use client';

import { useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, BookOpen, Check, Database, FileText, MessageSquare, Pause, Play } from 'lucide-react';
import { useIllustrationSequence } from './use-illustration-sequence';
import styles from './project-stories.module.css';

const sources = [
  { name: 'FAQs', key: 'FAQ', icon: MessageSquare, label: 'Policies & how-to', chunk: 'Check plan eligibility before activation.', body: 'One FAQ per document. General policies and how-to information enter the shared context.' },
  { name: 'Resolved tickets', key: 'TICKETS', icon: Database, label: 'Previous resolutions', chunk: 'Confirm that the roaming pack is active.', body: 'Resolved support tickets contribute prior resolutions from their own Chroma collection.' },
  { name: 'PDF guides', key: 'GUIDES', icon: BookOpen, label: 'Document passages', chunk: 'Enable roaming in the device settings.', body: 'Chunked PDF documentation contributes guide passages alongside FAQ and ticket results.' },
];
const stageNames = ['Question', 'Retrieve', 'Merge context', 'Answer'];
const answer = 'Check your plan’s eligibility, confirm the roaming pack is active, then enable roaming in your device settings.';

export function RetrievalDiagram() {
  const sequence = useIllustrationSequence(3, 1050);
  const { step, reduced, playing } = sequence;
  const [selected, setSelected] = useState(0);
  const chunks = useRef<(HTMLDivElement | null)[]>([]);
  const [origins, setOrigins] = useState(sources.map(() => ({ x:0, y:0 })));
  const id = useId();
  function toggle() {
    if (!reduced && !playing && step === 3) {
      const buttons = sequence.ref.current?.querySelectorAll<HTMLButtonElement>('.rag-sources button');
      setOrigins(sources.map((_, i) => {
        const source = buttons?.[i]?.getBoundingClientRect(), target = chunks.current[i]?.getBoundingClientRect();
        return source && target ? { x:source.left+source.width/2-target.left-target.width/2, y:source.top+source.height/2-target.top-target.height/2 } : { x:0,y:0 };
      }));
    }
    sequence.toggle();
  }
  return <div className={styles.retrievalContainer}><div className={`retrieval-diagram ${styles.retrieval}`} ref={sequence.ref} data-flow-stage={step}>
    <div className="visual-topline mono"><span>QUESTION → CONTEXT → ANSWER</span><span>RAG / 01</span></div>
    <div className={styles.query}><span className="mono">01 / USER QUESTION</span><div><MessageSquare size={18} aria-hidden="true" /><p>How do I activate international roaming?</p></div></div>
    <div className={styles.sourceHeading}><span className="mono">02 / RETRIEVE PASSAGES</span><span>Three source collections</span></div>
    <div className={`rag-sources ${styles.sources}`} role="group" aria-label="Explore the assistant’s knowledge sources">{sources.map((source, i) => { const Icon = source.icon; return <button key={source.key} aria-pressed={selected === i} aria-controls={`${id}-source`} onClick={() => { setSelected(i); sequence.select(step); }}><Icon size={20} strokeWidth={1.4} aria-hidden="true" /><span>{source.name}</span><small>{source.label}</small></button>; })}</div>
    <div id={`${id}-source`} className={styles.sourceExplanation}><span className="mono">{sources[selected].key}</span><p>{sources[selected].body}</p></div>
    <div className={styles.mergeConnector} aria-hidden="true"><svg viewBox="0 0 300 45" preserveAspectRatio="none"><path d="M50 0V12Q50 25 65 25H135Q150 25 150 40M150 0V40M250 0V12Q250 25 235 25H165Q150 25 150 40" stroke="currentColor" fill="none" />{playing && step >= 1 && !reduced && [50,150,250].map((x,i) => <motion.circle key={i} r="2.5" fill="#cfff77" initial={{ cx:x,cy:0 }} animate={{ cx:[x,x,150],cy:[0,22,40] }} transition={{ duration:.8,delay:i*.1 }} />)}</svg><ArrowDown size={13} /></div>
    <div className={`rag-context ${styles.merged}`} data-merged={step >= 2}><div className={styles.contextHeading}><span className="mono">03 / MERGED CONTEXT</span><span>{step >= 2 ? '3 sample passages' : step === 1 ? 'Retrieving…' : 'Pending retrieval'}</span></div><div className={styles.chunks}>{sources.map((source,i) => <motion.div key={`${source.key}-${step === 1 ? 'retrieving' : 'merged'}`} ref={element => { chunks.current[i] = element; }} className={styles.chunk} data-selected={selected === i} initial={reduced || !playing || step !== 1 ? false : { x:origins[i].x, y:origins[i].y, scale:.25 }} animate={{ x:0,y:0,scale:1 }} transition={{ duration:reduced?0:.65,delay:reduced?0:i*.13,ease:[.22,1,.36,1] }}><FileText size={14} aria-hidden="true" /><div><span className="mono">{source.key} / SAMPLE</span><p>{source.chunk}</p></div><Check size={13} aria-hidden="true" className={step >= 2 ? styles.checkVisible : styles.checkHidden} /></motion.div>)}</div></div>
    <div className={styles.answer}><div className={styles.answerHeading}><span className="mono">04 / GROUNDED ANSWER</span><span>{step === 3 ? 'Scripted example' : 'Awaiting context'}</span></div><div className={styles.answerBody}>
      {step === 3 ? <><p className="sr-only" role="status">Scripted illustrative answer: {answer}</p><p aria-hidden="true" className={styles.answerText}>{answer.split(' ').map((word,i) => <motion.span key={`${word}-${i}`} initial={reduced || sequence.run === 0 ? false : { opacity:0 }} animate={{ opacity:1 }} transition={{ duration:.12,delay:reduced?0:i*.025 }}>{word} </motion.span>)}</p><div className={styles.answerSources} aria-label="Sample context used">{sources.map(source => <span key={source.key}>{source.key}</span>)}</div></> : <p className={styles.answerPlaceholder}>{stageNames[step]} first.<br />The answer follows the context.</p>}
    </div></div>
    <div className={styles.controls}><button onClick={toggle} aria-label={reduced ? 'Next step — retrieval flow' : playing ? 'Pause flow — retrieval illustration' : step === 3 ? 'Trace the answer — retrieval illustration' : 'Continue flow — retrieval illustration'}>{playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}<span>{reduced ? 'Next step' : playing ? 'Pause flow' : step === 3 ? 'Trace the answer' : 'Continue flow'}</span></button><span className="mono" role="status">0{step+1} / {stageNames[step]}</span></div>
    <p className="visual-disclaimer">Illustrative retrieval flow. Sample passages and a scripted answer; no live retrieval or model call.</p>
  </div></div>;
}
