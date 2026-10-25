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

Project repositories and case-study content live in `src/lib/projects.ts`. Demo actions require a verified public frontend URL. The résumé action remains hidden until a real PDF is supplied. `src/lib/contact.ts` contains only an explicitly approved public contact email, when available.

QuickShow, RAG and capsule diagrams are local explanations; they do not call production services or establish performance measurements.

## Deployment

The existing Vercel project is `aayush-patil-portfolio`. Review changes on feature branches and use preview deployments. Production promotion is a separate, deliberate release step.
