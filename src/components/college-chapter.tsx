import { CollegeActivityMap } from './college-activity-map';
import journey from './journey.module.css';
import styles from './college.module.css';

export function CollegeChapter() {
  return <section id="college" data-journey-chapter className={`${journey.chapter} ${styles.college}`} aria-labelledby="college-title">
    <p data-journey-heading className={`mono ${journey.eyebrow}`}><span /> 02 / COLLEGE</p>
    <div className={styles.heading}><div><span className={`mono ${styles.institution}`}>INDIAN INSTITUTE OF INFORMATION TECHNOLOGY, NAGPUR</span><h2 id="college-title">IIIT Nagpur<span>.</span></h2></div><p className={styles.years}><time dateTime="2021">2021</time><span>—</span><time dateTime="2025">2025</time></p></div>
    <div className={styles.academic}><p>B.Tech in Computer Science and Engineering</p><span><span className="mono">CGPA</span> 7.6<span className={styles.gradeUnit}>/10</span></span></div>
    <div className={styles.storyHeading}><h3>More than a degree.</h3><p>Communities, representation, sports leadership,<br className={styles.desktopBreak} /> and the events that brought campus together.</p></div>
    <CollegeActivityMap />
    <div className={styles.footnote}><p><span>Problem-solving practice.</span> 1,000+ DSA problems solved.</p><span className="mono">CURIOSITY / PARTICIPATION / BUILDING</span></div>
  </section>;
}
