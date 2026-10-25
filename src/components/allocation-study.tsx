'use client';

import { useId, useState } from 'react';
import { ArrowRight, Play, RotateCcw } from 'lucide-react';

export function AllocationStudy() {
  const [raced, setRaced] = useState(false);
  const resultId = useId();
  return <div className="allocation-study">
    <div className="allocation-topline mono"><span>SHOW 01 / SEAT E7</span><span>SIMULATION</span></div>
    <div className="allocation-grid" aria-hidden="true"><div className="screen-line" /><span className="screen-caption mono">SCREEN</span><div className="seat-grid">{Array.from({ length: 54 }, (_, index) => <span key={index} className={`seat ${index === 42 ? 'target-seat' : ''} ${index === 42 && raced ? 'seat-committed' : ''} ${[3, 9, 14, 23, 39, 48, 50].includes(index) ? 'seat-occupied' : ''}`}>{index === 42 ? 'E7' : ''}</span>)}</div></div>
    <div className="allocation-result" id={resultId} aria-live="polite"><div><span className={`result-dot ${raced ? 'accepted' : ''}`} /><span>Request A</span><span className="mono">{raced ? '201 / COMMITTED' : 'WAITING'}</span></div><div><span className={`result-dot ${raced ? 'conflict' : ''}`} /><span>Request B</span><span className="mono">{raced ? '409 / CONFLICT' : 'WAITING'}</span></div></div>
    <button className="race-button" aria-controls={resultId} onClick={() => setRaced(value => !value)}>{raced ? <><RotateCcw size={17} aria-hidden="true" /> Reset simulation</> : <><Play size={16} aria-hidden="true" /> Race for seat E7</>}<ArrowRight size={18} aria-hidden="true" /></button>
    <p className="allocation-disclaimer">{raced ? 'One possible same-seat outcome. The real lock covers the entire show.' : 'Illustrative only. Runs in your browser, separately from the QuickShow app.'}</p>
  </div>;
}
