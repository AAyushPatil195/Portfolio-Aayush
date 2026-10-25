'use client';

import { ArrowRight, FileText, KeyRound, LockKeyhole } from 'lucide-react';
export { RetrievalDiagram } from './retrieval-flow';
export { CapsuleLifecycle } from './capsule-lifecycle';

export function FileAccessDiagram() {
  return <div className="file-access-diagram" role="img" aria-label="File download access flow: verify the authenticated owner, look up the matching file, then issue a short-lived signed URL.">
    <span className="mono">OWNERSHIP BEFORE ACCESS</span><div className="access-flow"><div><KeyRound size={24} strokeWidth={1.3} aria-hidden="true" /><span>Owner</span></div><ArrowRight size={20} aria-hidden="true" /><div><FileText size={24} strokeWidth={1.3} aria-hidden="true" /><span>File</span></div><ArrowRight size={20} aria-hidden="true" /><div><LockKeyhole size={24} strokeWidth={1.3} aria-hidden="true" /><span>Signed URL</span></div></div><span className="access-caption">User-scoped lookup → temporary storage access</span>
  </div>;
}
