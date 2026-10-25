import Link from 'next/link';
import { SiteHeader } from '@/components/site-chrome';

export default function NotFound() {
  return <><SiteHeader caseStudy /><main className="not-found" id="main" tabIndex={-1}><span className="mono">404 / NO ROUTE HERE</span><h1>Let’s take a better path.</h1><Link className="project-action action-primary" href="/">Back to the portfolio →</Link></main></>;
}
