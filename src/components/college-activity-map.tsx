'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowDownRight, Plus } from 'lucide-react';
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
  // Matching command counts let Motion interpolate an opened route smoothly.
  const [first,rest]=splitCurve(points,1/3),[second,third]=splitCurve(rest,.5);
  const xy=(p:Point)=>`${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  return `M ${xy(points[0])} ${[first,second,third].map(part=>`C ${part.slice(1).map(xy).join(', ')}`).join(' ')}`;
}
function connections(points: {x:number;y:number}[], compact: boolean, groups?: {right:number;bottom:number;open:boolean}[]) {
  return points.slice(1).map((b,i) => {
    const a=points[i];
    if (compact) { const start=a.y+24,end=b.y-25,mid=(start+end)/2;return `M ${a.x} ${start} C ${a.x-13} ${mid}, ${b.x+13} ${mid}, ${b.x} ${end}`; }
    if (groups?.[i].open && i!==1) {
      const safeY=groups[i].bottom+22,corridor=(groups[i].right+b.x-25)/2;
      return `M ${a.x} ${a.y+24} C ${a.x-8} ${a.y+90}, ${a.x-14} ${safeY}, ${a.x+30} ${safeY} C ${corridor-80} ${safeY+8}, ${corridor} ${safeY-10}, ${corridor} ${safeY-50} C ${corridor-8} ${b.y+30}, ${corridor} ${b.y}, ${b.x-25} ${b.y}`;
    }
    if (i===1) return `M ${a.x} ${a.y+24} C ${a.x+14} ${a.y+160}, ${b.x-80} ${b.y-120}, ${b.x} ${b.y-25}`;
    return threePartCurve([{x:a.x,y:a.y+24},{x:a.x,y:a.y+135},{x:b.x-160,y:b.y+100},{x:b.x-25,y:b.y}]);
  });
}

function ActivityConnection({ d,index,progress,reduced,marker }: {d:string;index:number;progress:MotionValue<number>;reduced:boolean;marker:string}) {
  const trace = useTransform(progress,[index/3,(index+1)/3],[0,1]);
  return <><path className={styles.connectionBase} d={d} vectorEffect="non-scaling-stroke" markerEnd={marker} /><motion.path data-connection-index={index} className={styles.connectionTrace} initial={false} animate={{d}} style={{pathLength:reduced?1:trace}} transition={{duration:reduced?0:.3}} vectorEffect="non-scaling-stroke" /></>;
}

export function CollegeActivityMap() {
  const canvas = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLSpanElement|null)[]>([]);
  const [geometry,setGeometry] = useState({width:1000,height:429,paths:connections(initialPoints,false),ready:false});
  const [active,setActive] = useState<string|null>(null);
  const [reached,setReached] = useState(0);
  const reachedRef=useRef(0);
  const reduced = useMotionPreference();
  const id=useId();
  const {scrollYProgress} = useScroll({target:canvas,offset:['start 0.9','end 0.4']});
  useMotionValueEvent(scrollYProgress,'change',value=>{const next=Math.min(3,Math.floor(value*4));if(next!==reachedRef.current){reachedRef.current=next;setReached(next);}});

  useEffect(()=>{
    const element=canvas.current;if(!element)return;
    let frame=0,disposed=false;
    const measure=()=>{if(disposed)return;const bounds=element.getBoundingClientRect();const points=markers.current.map(marker=>{const box=marker!.getBoundingClientRect();return{x:box.left-bounds.left+box.width/2,y:box.top-bounds.top+box.height/2};});const groups=Array.from(element.querySelectorAll('details')).map(group=>{const box=group.getBoundingClientRect();return{right:box.right-bounds.left,bottom:box.bottom-bounds.top,open:group.open};});setGeometry({width:bounds.width,height:bounds.height,paths:connections(points,bounds.width<800,groups),ready:true});};
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    const observer=new ResizeObserver(schedule);observer.observe(element);element.querySelectorAll('details,summary').forEach(item=>observer.observe(item));
    document.fonts.ready.then(schedule);window.addEventListener('resize',schedule);measure();
    return()=>{disposed=true;observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);};
  },[]);

  return <div className={styles.activity}>
    <div className={styles.mapCaption}><span className="mono">FOUR THREADS. NOT A TIMELINE.</span><span>Select a thread to explore <ArrowDownRight size={14} aria-hidden="true" /></span></div>
    <div className={styles.canvas} ref={canvas} data-college-map data-map-ready={geometry.ready} data-open-thread={active??'none'}>
      <svg className={styles.activityPaths} viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true"><defs><marker id={`${id}-arrow`} markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 1 3 4 0 7" fill="none" stroke="#8badd080" strokeWidth="1" /></marker></defs>{geometry.paths.map((d,i)=><ActivityConnection key={i} d={d} index={i} progress={scrollYProgress} reduced={reduced} marker={`url(#${id}-arrow)`} />)}</svg>
      {threads.map((thread,i)=><details key={thread.id} name="college-threads" id={`college-${thread.id}`} className={styles.thread} data-thread={thread.id} data-reached={reduced||i<=reached} onToggle={event=>{const open=event.currentTarget.open;setActive(previous=>open?thread.id:previous===thread.id?null:previous);}}>
        <summary className={styles.threadSummary}><span ref={element=>{markers.current[i]=element;}} className={styles.marker} data-college-entry={i===0?'true':undefined} aria-hidden="true">{thread.letter}</span><span className={styles.threadWords}><span className={styles.threadTitle}>{thread.title}</span><span className={styles.threadSummaryText}>{thread.summary}</span><span className={styles.explore}>Explore <Plus size={14} aria-hidden="true" /></span></span></summary>
        <div className={styles.detailContent}><div className={styles.detailHeading}><span className="mono">{thread.letter} / {thread.title.toUpperCase()}</span><p>{thread.hint}</p></div><dl>{thread.entries.map(([name,roles])=><div key={name}><dt>{name}</dt>{roles&&<dd>{roles.split('|').map(role=><span key={role}>{role}</span>)}</dd>}</div>)}</dl></div>
      </details>)}
    </div>
  </div>;
}
