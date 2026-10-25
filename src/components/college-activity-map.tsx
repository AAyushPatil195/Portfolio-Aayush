'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowDownRight, Plus, X } from 'lucide-react';
import { useMotionPreference } from './motion-primitives';
import styles from './college.module.css';

// Exact user-supplied roles. These are thematic groups, not dated stages.
const threads = [
  { id:'community',letter:'C',title:'Community',summary:'Clubs & communities',hint:'The people around the ideas.',entries:[['Probe Club','Media Club member'],['CRISPR','Founding team member'],['DOTSLASH','Club member'],['Udyam E-Cell','Member']] },
  { id:'representation',letter:'R',title:'Representation',summary:'A voice on campus',hint:'Section & EBSB representation.',entries:[['Section Representative',''],['Manipur EBSB Representative','']] },
  { id:'leadership',letter:'L',title:'Leadership',summary:'Sports Secretary',hint:'Sport & campus leadership.',entries:[['Sports Secretary','']] },
  { id:'events',letter:'E',title:'Events & festivals',summary:'Kshitij · Tantra Fiesta · Abhivyakti',hint:'Organization, content & collaboration.',entries:[['Events organized','Kshitij 2023|Kshitij 2024'],['Tantra Fiesta — Technical Festival','Event Management Co-Lead|Content Lead'],['Abhivyakti — Cultural Festival','Content Lead|Corporate/PR Co-Lead']] },
];
const initialPoints = [{x:22,y:58},{x:562,y:140},{x:50,y:260},{x:590,y:326}];
type Point = {x:number;y:number};
function splitCurve(points: Point[], t: number) {
  const mix=(a:Point,b:Point)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  const a=mix(points[0],points[1]),b=mix(points[1],points[2]),c=mix(points[2],points[3]);
  const d=mix(a,b),e=mix(b,c),f=mix(d,e);
  return [[points[0],a,d,f],[f,e,c,points[3]]];
}
function threePartCurve(points: Point[]) {
  // Preserve the approved three-segment curves independently of activity details.
  const [first,rest]=splitCurve(points,1/3),[second,third]=splitCurve(rest,.5);
  const xy=(p:Point)=>`${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  return `M ${xy(points[0])} ${[first,second,third].map(part=>`C ${part.slice(1).map(xy).join(', ')}`).join(' ')}`;
}
function connections(points: Point[], compact: boolean) {
  return points.slice(1).map((b,i) => {
    const a=points[i];
    if (compact) { const start=a.y+24,end=b.y-25,mid=(start+end)/2;return `M ${a.x} ${start} C ${a.x-13} ${mid}, ${b.x+13} ${mid}, ${b.x} ${end}`; }
    if (i===1) return `M ${a.x} ${a.y+24} C ${a.x+14} ${a.y+160}, ${b.x-80} ${b.y-120}, ${b.x} ${b.y-25}`;
    return threePartCurve([{x:a.x,y:a.y+24},{x:a.x,y:a.y+135},{x:b.x-160,y:b.y+100},{x:b.x-25,y:b.y}]);
  });
}

function ActivityConnection({ d,index,progress,reduced,marker }: {d:string;index:number;progress:MotionValue<number>;reduced:boolean;marker:string}) {
  const trace = useTransform(progress,[index/3,(index+1)/3],[0,1]);
  return <><path data-connection-base={index} className={styles.connectionBase} d={d} vectorEffect="non-scaling-stroke" markerEnd={marker} /><motion.path data-connection-index={index} className={styles.connectionTrace} d={d} style={{pathLength:reduced?1:trace}} vectorEffect="non-scaling-stroke" /></>;
}

export function CollegeActivityMap() {
  const form = useRef<HTMLFormElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLSpanElement|null)[]>([]);
  const [geometry,setGeometry] = useState({width:1000,height:429,paths:connections(initialPoints,false),ready:false});
  const [active,setActive] = useState<string|null>(null);
  const [enhanced,setEnhanced] = useState(false);
  const [reached,setReached] = useState(0);
  const reachedRef=useRef(0);
  const reduced = useMotionPreference();
  const id=useId();
  const {scrollYProgress} = useScroll({target:canvas,offset:['start 0.9','end 0.4']});
  useMotionValueEvent(scrollYProgress,'change',value=>{const next=Math.min(3,Math.floor(value*4));if(next!==reachedRef.current){reachedRef.current=next;setReached(next);}});

  useEffect(()=>{
    // Native radio selection also works before hydration and with JavaScript disabled.
    setActive(form.current?.querySelector<HTMLInputElement>('input[data-college-choice]:checked')?.value??null);
    setEnhanced(true);
  },[]);

  useEffect(()=>{
    const element=canvas.current;if(!element)return;
    let frame=0,disposed=false;
    const measure=()=>{if(disposed)return;const bounds=element.getBoundingClientRect();const points=markers.current.map(marker=>{const box=marker!.getBoundingClientRect();return{x:box.left-bounds.left+box.width/2,y:box.top-bounds.top+box.height/2};});setGeometry({width:bounds.width,height:bounds.height,paths:connections(points,bounds.width<800),ready:true});};
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    // Details are deliberately outside this measured stage. Selecting a group cannot reroute it.
    const observer=new ResizeObserver(schedule);observer.observe(element);markers.current.forEach(marker=>{if(marker)observer.observe(marker);});
    document.fonts.ready.then(schedule);window.addEventListener('resize',schedule);measure();
    return()=>{disposed=true;observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);};
  },[]);

  return <form ref={form} className={styles.activity} onSubmit={event=>event.preventDefault()} onReset={()=>{
    const selected=form.current?.querySelector<HTMLInputElement>('input[data-college-choice]:checked');
    setActive(null);selected?.focus();
  }}>
    <fieldset className={styles.selector}>
    <legend className="sr-only">Explore college activities</legend>
    <input type="radio" name={`${id}-activity`} value="none" defaultChecked hidden disabled />
    <div className={styles.mapCaption}><span className="mono">FOUR THREADS. NOT A TIMELINE.</span><span>Select a thread to explore <ArrowDownRight size={14} aria-hidden="true" /></span></div>
    <div className={styles.canvas} ref={canvas} data-college-map data-map-ready={geometry.ready} data-open-thread={active??'none'}>
      <svg className={styles.activityPaths} viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true"><defs><marker id={`${id}-arrow`} markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 1 3 4 0 7" fill="none" stroke="#8badd080" strokeWidth="1" /></marker></defs>{geometry.paths.map((d,i)=><ActivityConnection key={i} d={d} index={i} progress={scrollYProgress} reduced={reduced} marker={`url(#${id}-arrow)`} />)}</svg>
      {threads.map((thread,i)=><div key={thread.id} id={`college-${thread.id}`} className={styles.thread} data-thread={thread.id} data-reached={reduced||i<=reached}>
        <div className={styles.nodeBody}>
          {/* Native input events also cover reselecting the same radio after a form reset. */}
          <input type="radio" className={styles.control} id={`${id}-${thread.id}`} name={`${id}-activity`} value={thread.id} data-college-choice={thread.id} aria-label={`${thread.title} — view activities`} aria-controls={`${id}-panel-${thread.id}`} onInput={()=>setActive(thread.id)} />
          <label htmlFor={`${id}-${thread.id}`} className={styles.threadSummary}><span ref={element=>{markers.current[i]=element;}} className={styles.marker} data-college-entry={i===0?'true':undefined} data-college-marker={thread.id} aria-hidden="true">{thread.letter}</span><span className={styles.threadWords}><span className={styles.threadTitle}>{thread.title}</span><span className={styles.threadSummaryText}>{thread.summary}</span><span className={styles.explore}>Explore <Plus size={14} aria-hidden="true" /></span></span></label>
          <a href="#college-details" className={styles.readDetails} aria-label={`Read ${thread.title.toLowerCase()} details`}>Read details <ArrowDownRight size={14} aria-hidden="true" /></a>
        </div>
      </div>)}
    </div>
    <div className={styles.detailsViewport}>
      <div className={styles.detailsClip}>
        <section id="college-details" tabIndex={-1} className={styles.detailsShell} aria-label="Selected college activity details">
          <div className={styles.panelToolbar}><span className="mono">COLLEGE / ACTIVITY NOTES</span><button type="reset">Close details <X size={14} aria-hidden="true" /></button></div>
          <div className={styles.panelStack}>
            {threads.map(thread=><motion.div key={thread.id} id={`${id}-panel-${thread.id}`} className={styles.detailContent} data-panel={thread.id} role="region" aria-labelledby={`${id}-heading-${thread.id}`} inert={enhanced&&active!==thread.id} aria-hidden={enhanced?active!==thread.id:undefined} initial={false} animate={enhanced?{y:active===thread.id?0:5}:undefined} transition={{duration:reduced?0:.22}}>
              <div className={styles.detailHeading}><span className={styles.detailLetter} aria-hidden="true">{thread.letter}</span><div><h4 id={`${id}-heading-${thread.id}`}>{thread.title}</h4><p>{thread.hint}</p></div></div>
              <dl>{thread.entries.map(([name,roles])=><div key={name}><dt>{name}</dt>{roles&&<dd>{roles.split('|').map(role=><span key={role}>{role}</span>)}</dd>}</div>)}</dl>
            </motion.div>)}
          </div>
        </section>
      </div>
    </div>
    </fieldset>
    <span className="sr-only" role="status">{active?`${threads.find(thread=>thread.id===active)?.title} details selected.`:''}</span>
  </form>;
}
