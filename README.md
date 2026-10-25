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

The existing Vercel project `aayush-patil-portfolio` is connected to `AAyushPatil195/Portfolio-Aayush`. `main` contains the approved baseline; current College refinements live on `refinement/college-activity-journey`. Branch pushes produce Vercel previews. Production promotion/merging into the production branch is a separate, deliberate release step.

GitHub Actions runs TypeScript and the production build on pushes and pull requests using Node.js 24. Actions are pinned to reviewed commit hashes. The existing authenticated Vercel CLI preview workflow remains available; local `.vercel` metadata is intentionally not committed.

Run `node scripts/refinements-checks.mjs` against the local dev server for responsive, keyboard, reduced-motion, animation and route checks. Set `PREVIEW_URL` and `CAPTURE_DIR` to verify a deployed preview and save artifacts elsewhere.

Project repository documentation follow-ups are recorded in [docs/repository-readiness.md](docs/repository-readiness.md).

College review checks: `node scripts/college-checks.mjs`. The activity map uses thematic native disclosures, not a dated chronology. Private reference folders and PDFs are excluded from source control and deployments.
