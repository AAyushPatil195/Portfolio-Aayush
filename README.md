# Aayush Patil — Portfolio

A continuous engineering journey built with Next.js, React, TypeScript and Motion for React. Graphite/lime art direction, a viewport-anchored chapter navigator, and clearly labelled interactive project illustrations.

## Local development

```sh
npm ci
npm run dev
```

## Verify

```sh
npm run typecheck
npm run build
npm start
```

Browser checks use local Chrome through Playwright. Generated screenshots, recordings, local research, `.env*`, build output and Vercel credentials/link metadata are excluded from Git.

## Content and simulations

Project repositories and case-study content live in `src/lib/projects.ts`. Demo actions require a verified public frontend URL. The résumé action remains hidden until a PDF is explicitly approved for publication; source reference documents stay private. `src/lib/contact.ts` contains only an explicitly approved public contact email, when available.

QuickShow, RAG and capsule diagrams are local explanations; they do not call production services or establish performance measurements.

## Deployment

The existing Vercel project `aayush-patil-portfolio` is connected to `AAyushPatil195/Portfolio-Aayush`. `main` contains the approved baseline; current College and career refinements live on `refinement/college-career-checkpoints`. Branch pushes produce Vercel previews. Production promotion/merging into the production branch is a separate, deliberate release step.

GitHub Actions runs TypeScript and the production build on pushes and pull requests using Node.js 24. Actions are pinned to reviewed commit hashes. The existing authenticated Vercel CLI preview workflow remains available; local `.vercel` metadata is intentionally not committed.

Run `node scripts/refinements-checks.mjs` against the local dev server for responsive, keyboard, reduced-motion, animation and route checks. Set `PREVIEW_URL` and `CAPTURE_DIR` to verify a deployed preview and save artifacts elsewhere.

Project repository documentation follow-ups are recorded in [docs/repository-readiness.md](docs/repository-readiness.md).

College and career review checks: `node scripts/checkpoint-refinement-checks.mjs` (also available through `scripts/college-checks.mjs`). College uses a fixed vertical checkpoint selector with horizontally revealed desktop details, and a single-open inline accordion below 1024px. Its four groups are thematic, not a dated chronology. No-JavaScript visitors receive native single-open details with the complete verified content. Professional Journey uses two independent chronological list entries and articles, with scroll-linked milestone markers and a restrained connection.

The checks cover exact desktop checkpoint geometry, all activity facts, rapid switching, keyboard navigation, reduced motion, no-JavaScript disclosure, company independence and dates, and forward/reverse chapter navigation. Capture College states and both experiences with `node scripts/checkpoint-refinement-capture.mjs`; record both sections with `node scripts/checkpoint-refinement-record.mjs`. The older College capture/record commands forward to these helpers. Set `PREVIEW_URL` and `CAPTURE_DIR` for public preview verification. Private reference folders and PDFs remain excluded from source control and deployments.
