import type { Metadata } from 'next';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/manrope';
import '@fontsource/jetbrains-mono/400.css';
import { MotionProvider } from '@/components/motion-primitives';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Aayush Patil — Software Engineer', template: '%s | Aayush Patil' },
  description: 'Software engineering, reliable backend systems, and applied AI. Explore Aayush Patil’s selected projects and engineering case studies.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><MotionProvider><a href="#main" className="skip-link">Skip to content</a>{children}</MotionProvider></body></html>;
}
