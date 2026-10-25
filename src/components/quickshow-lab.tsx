'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { SystemMap } from './system-map';
import { AllocationStudy } from './allocation-study';
import styles from './journey-chapters.module.css';

const views = ['Architecture', 'Seat contention'];

export function QuickShowLab() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : event.key === 'ArrowRight' ? (index + 1) % 2 : event.key === 'ArrowLeft' ? (index + 1) % 2 : -1;
    if (next < 0) return;
    event.preventDefault(); setSelected(next); buttons.current[next]?.focus();
  }
  return <div className={styles.lab}>
    <div className={styles.labBar}><div role="tablist" aria-label="QuickShow portfolio simulations">{views.map((view, i) => <button key={view} ref={el => { buttons.current[i] = el; }} role="tab" id={`${id}-tab-${i}`} aria-selected={selected === i} aria-controls={`${id}-panel-${i}`} tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={event => navigate(event, i)}>{view}<span aria-hidden="true">0{i + 1}</span></button>)}</div><span className="mono">LOCAL / INTERACTIVE</span></div>
    <div className={styles.labPanels}>
      <div role="tabpanel" id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`} tabIndex={0} className={styles.labPanel} data-visible={selected === 0} inert={selected !== 0}><SystemMap /></div>
      <div role="tabpanel" id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`} tabIndex={0} className={`${styles.labPanel} ${styles.seatPanel}`} data-visible={selected === 1} inert={selected !== 1}>
        <div className={styles.seatStory}><span className="mono">THE BOOKING LAB</span><h4>One seat.<br />Two requests.<br /><span>One decision.</span></h4><p>A show-wide Redis lock coordinates entry. MongoDB decides what commits.</p><p>Try a same-seat conflict, then reset to run it again.</p></div><AllocationStudy />
      </div>
    </div>
    <p className={styles.labDisclaimer}>Portfolio simulations, separate from the QuickShow application. No live services or performance measurements.</p>
  </div>;
}
