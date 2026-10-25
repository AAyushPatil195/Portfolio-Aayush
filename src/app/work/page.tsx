import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { FeaturedProjects } from '@/components/featured-projects';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { SystemMap } from '@/components/system-map';
import { WorkExperience } from '@/components/work-experience';
import styles from '@/components/journey.module.css';

export const metadata: Metadata = { title: 'Selected Work & Experience', description: 'Aayush Patil’s engineering projects, interactive demonstrations, and professional experience.' };

export default function Work() {
  return <><SiteHeader /><main id="main" tabIndex={-1}>
    <header className={styles.workIntro}><Link href="/"><ArrowLeft size={16} aria-hidden="true" /> Back to my journey</Link><h1>Things I’ve built<span className="lime-text">.</span></h1><p>Selected projects, the engineering inside them, and the teams I’ve worked with.</p><details className={styles.workArchitecture}><summary>Explore QuickShow’s booking architecture <Plus size={18} aria-hidden="true" /></summary><SystemMap /></details></header>
    <FeaturedProjects /><WorkExperience />
  </main><SiteFooter /></>;
}
