'use client';

import { useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Clock3, FileText, LockKeyhole, Pause, Play, UnlockKeyhole } from 'lucide-react';
import { useIllustrationSequence } from './use-illustration-sequence';
import styles from './project-stories.module.css';

const phases = [
  { name:'Create',icon:FileText,code:'201',status:'CREATED',time:'t = 0',title:'A message for later.',body:'A future unlock time and a generated code establish the capsule’s lifecycle.' },
  { name:'Lock',icon:LockKeyhole,code:'403',status:'TOO EARLY',time:'before unlock_at',title:'Timing is part of access.',body:'Before unlock_at, an individual read is rejected—even with the right owner and code.' },
  { name:'Unlock',icon:UnlockKeyhole,code:'200',status:'AVAILABLE',time:'unlock_at',title:'The right time. The right owner.',body:'After unlock_at, the authenticated owner and valid unlock code can access the message.' },
  { name:'Expire',icon:Clock3,code:'410',status:'EXPIRED',time:'unlock_at + 30 days',title:'The window has closed.',body:'Thirty days after unlock, the individual read path treats the capsule as expired.' },
];

export function CapsuleLifecycle() {
  const sequence = useIllustrationSequence(1, 1550);
  const { step, reduced, playing } = sequence;
  const phase = phases[step], Icon = phase.icon;
  const playLabel = reduced ? 'Next stage' : playing ? 'Pause lifecycle' : step === 3 ? 'Replay lifecycle' : sequence.run > 0 ? 'Continue lifecycle' : 'Play lifecycle';
  const id = useId();
  return <div className={`capsule-lifecycle ${styles.capsule}`} ref={sequence.ref} data-phase={phase.name.toLowerCase()}>
    <div className="visual-topline mono"><span>TIME AS AN ACCESS RULE</span><span>LIFECYCLE / 04</span></div>
    <div className={`capsule-phase ${styles.phase}`} id={id}>
      <div className={styles.clock} aria-hidden="true"><svg viewBox="0 0 150 150"><circle className={styles.clockBase} cx="75" cy="75" r="65" /><motion.circle className={styles.clockProgress} cx="75" cy="75" r="65" fill="none" strokeWidth="2" style={{ rotate:-90 }} initial={false} animate={{ pathLength:step/3 }} transition={{ duration:reduced?0:.65 }} />{Array.from({length:12},(_,i)=><path key={i} d="M75 4V10" transform={`rotate(${i*30} 75 75)`} stroke="currentColor" opacity=".45" />)}</svg><motion.span className={styles.clockHand} initial={false} animate={{ rotate:step*90 }} transition={{ duration:reduced?0:.8,ease:[.22,1,.36,1] }}><svg viewBox="0 0 150 150"><path d="M75 75V23" stroke="currentColor" strokeWidth="1.4" /><circle cx="75" cy="21" r="3" fill="currentColor" /></svg></motion.span><AnimatePresence mode="wait" initial={false}><motion.span key={step} className={styles.clockIcon} initial={{ scale:reduced?1:.8 }} animate={{ scale:1 }} exit={{ scale:reduced?1:.8 }} transition={{ duration:reduced?0:.14 }}><Icon size={30} strokeWidth={1.3} /></motion.span></AnimatePresence></div>
      <p className={`mono ${styles.time}`}>{phase.time}</p><div className={`capsule-response mono ${styles.response}`}><span>{phase.code}</span> / {phase.status}</div>
      <motion.div key={step} initial={reduced ? false : { y:7 }} animate={{ y:0 }} transition={{ duration:.3 }}><p className="phase-title">{phase.title}</p><p>{phase.body}</p></motion.div>
    </div>
    <div className={styles.lifecycleTrack} aria-hidden="true"><motion.span initial={false} animate={{ scaleX:step/3 }} transition={{ duration:reduced?0:.6 }} /></div>
    <div className={`lifecycle-steps ${styles.steps}`} role="group" aria-label="Explore the capsule lifecycle">{phases.map((item,i)=><button key={item.name} aria-pressed={step===i} aria-controls={id} onClick={()=>sequence.select(i)} data-complete={i<step}><span className="step-dot">0{i+1}</span><span>{item.name}</span></button>)}</div>
    <div className={`${styles.controls} ${styles.capsuleControls}`}><button onClick={sequence.toggle}>{playing?<Pause size={14} aria-hidden="true" />:<Play size={14} aria-hidden="true" />}<span>{playLabel}</span></button><span className="mono" role="status">0{step+1} / {phase.name}</span></div>
    <p className="visual-disclaimer">Illustrative lifecycle · Playback compresses time. No live API request.</p>
  </div>;
}
