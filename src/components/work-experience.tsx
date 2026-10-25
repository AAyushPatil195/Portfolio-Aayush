import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/motion-primitives';
import { ExperienceLoop } from '@/components/experience-loop';
import styles from './work-experience.module.css';

export function WorkExperience() {
  return <section className={styles.experience} id="experience" aria-labelledby="experience-title">
    <div className={`section-kicker mono ${styles.kicker}`}><span>02 / WORK EXPERIENCE</span><span>PRODUCT INTERFACES → ENGINEERING SYSTEMS</span></div>
    <Reveal className={styles.introduction}>
      <h2 id="experience-title">Inside the<br /><span>release cycle.</span></h2>
      <p>Fixing what breaks. Building what helps.<br className={styles.desktopBreak} /> Testing what ships. Engineering work across the frontend, backend, and the tools in between.</p>
    </Reveal>

    <article id="browserstack" aria-labelledby="browserstack-title" className={styles.primary}>
      <header className={styles.companyHeader}>
        <div className={styles.companyIdentity}><span className={`mono ${styles.index}`}>01</span><div><h3 id="browserstack-title">BrowserStack<span className={styles.companyDot}>.</span></h3><p className={styles.role}>Software Development Engineer</p></div></div>
        <p className={styles.dates}><time dateTime="2025-06">June 2025</time><span aria-hidden="true">—</span><time dateTime="2026-04">April 2026</time></p>
      </header>

      <ExperienceLoop>
        <div className={styles.contributions}>
          <section className={styles.contribution} id="experience-diagnose" data-contribution="diagnose" aria-labelledby="diagnose-title">
            <div className={styles.rowLabel}><span className="mono">01 / DIAGNOSE</span><ArrowDownRight size={20} aria-hidden="true" /></div>
            <Reveal><h4 id="diagnose-title">Find the fault.<br />Follow it through.</h4>
              <p>Fixed frontend UI defects and persistent backend bugs. Investigated <strong>17 RBAC permission defects</strong> and <strong>25+ additional bugs</strong>.</p>
              <p className={styles.technical}>Across the interface and the services behind it.</p>
            </Reveal>
          </section>

          <section className={styles.contribution} id="experience-build" data-contribution="build" aria-labelledby="build-title">
            <div className={styles.rowLabel}><span className="mono">02 / BUILD</span><ArrowDownRight size={20} aria-hidden="true" /></div>
            <Reveal><h4 id="build-title">Better tools for<br />the engineering loop.</h4>
              <p>Built <strong>AI-assisted engineering agents</strong> for PR reviews and Jira updates. Supported <strong>11+ product features</strong>, including RBAC and reporting workflows.</p>
              <p className={styles.technical}>JavaScript / Node.js / React</p>
            </Reveal>
          </section>

          <section className={`${styles.contribution} ${styles.verification}`} id="experience-verify" data-contribution="verify" aria-labelledby="verify-title">
            <div className={styles.rowLabel}><span className="mono">03 / VERIFY</span><ArrowDownRight size={20} aria-hidden="true" /></div>
            <Reveal><h4 id="verify-title">Make the checks count.</h4>
              <div className={styles.testCount}><span>130<span>+</span></span><p>API, UI & visual<br />regression tests developed</p></div>
              <p>Added missing frontend and backend unit tests, alongside API, UI, and visual regression coverage.</p>
              <p className={styles.technical}>Jest / PactumJS / NightwatchJS / Percy</p>
            </Reveal>
          </section>

          <section className={styles.contribution} id="experience-release" data-contribution="release" aria-labelledby="release-title">
            <div className={styles.rowLabel}><span className="mono">04 / RELEASE</span><ArrowDownRight size={20} aria-hidden="true" /></div>
            <Reveal><h4 id="release-title">Carry it into release.</h4>
              <p>Supported <strong>CI and release validation</strong> with Jenkins and Kubernetes.</p>
              <p className={styles.technical}>Jenkins / Kubernetes</p>
            </Reveal>
          </section>
        </div>
      </ExperienceLoop>
    </article>

    <article id="finixia" className={styles.secondary} aria-labelledby="finixia-title">
      <div className={styles.secondaryIdentity}><span className={`mono ${styles.index}`}>02</span><div><p className={`mono ${styles.secondaryLabel}`}>PRODUCT & INTERFACE DEVELOPMENT</p><h3 id="finixia-title">Finixia Dedecons</h3><p className={styles.role}>Frontend Developer</p><p className={styles.dates}><time dateTime="2025-01">January 2025</time><span aria-hidden="true">—</span><time dateTime="2025-06">June 2025</time></p></div></div>
      <Reveal className={styles.secondaryStory}><ArrowUpRight className={styles.secondaryArrow} size={25} aria-hidden="true" /><h4>From APIs to interfaces.</h4><p>Developed responsive React and Tailwind interfaces, integrated REST APIs, and built reusable frontend components.</p><p>Contributed to <strong>Wens Force</strong> and <strong>Melo Films</strong>.</p><p className={styles.technical}>React / JavaScript / Tailwind CSS / REST APIs</p></Reveal>
    </article>
    <div className={`mono ${styles.sectionEnd}`}><span>END OF EXPERIENCE / CONTINUE THE CONVERSATION</span><a href="#contact">Let’s talk <ArrowDownRight size={17} aria-hidden="true" /></a></div>
  </section>;
}
