# Aayush Patil — Portfolio Blueprint (v1)

## Current direction — My Journey (25 October 2026)

The user's approved **My Journey — An Interactive Engineering Story** direction supersedes the homepage order and architecture-led hero described in the original v1 below. Preserve the graphite/lime palette, typography, existing engineering interactions, source-backed projects, and case studies.

Current review milestone: **Milestone B ? Complete the Continuous Journey Homepage**, explicitly authorized after Milestone A's structural approval. Preserve the approved first three chapters and extend the overview through Contact on `/`. Stop for visual review after preview deployment and verification.

- **00 / Introduction:** personal software-engineering introduction; backend systems and applied AI; curiosity, experimenting, and building products; state-level football. Explore My Journey and Jump to Work both stay on the homepage.
- **01 / Foundations:** 10th Standard, 2019, 91%; 12th Standard, 2021, 93%; JEE Main 2021, **96 percentile** (secondary: Among the top 4%); MHT-CET 2021, **99.4 percentile** (secondary: Among the top ~0.6%). Secondary descriptions stay regular-weight.
- **02 / College:** IIIT Nagpur, B.Tech CSE, 2021?2025, CGPA 7.6/10. Technical-fest leadership at the supplied general level, engineering interests, and optional 1,000+ DSA problems detail.
- **03 / Professional Journey:** Finixia then BrowserStack, chronologically. BrowserStack receives more prominence. Two?three concise highlights per company and deep links to preserved `/work` experience.
- **04 / Things I've Built:** QuickShow flagship with architecture/request and seat-contention simulations clearly distinguished from the actual application. Then Telecom Support Assistant, Time Capsule API, and File Manager with distinct previews and existing case studies. No Live Demo without a verified public frontend.
- **05 / Beyond Code:** state-level football, technology curiosity, experiments, product-building and problem-solving. No invented anecdotes.
- **06 / Contact:** cinematic closing, approved LinkedIn and GitHub. Public email awaits user confirmation; do not infer it from account/authentication metadata. R?sum? download remains hidden until the real PDF is available in the workspace.

Signature interaction: a continuous-looking serpentine SVG navigator in a dedicated left gutter, anchored to the visible viewport while content scrolls. Keep the whole map in view, with scroll-linked progress, readable current-chapter context, softly illuminated completed checkpoints, and restrained active glow. Use a narrower mobile trail, native scrolling, readable server-rendered content, keyboard-accessible anchors, and reduced-motion fallbacks. Existing Motion infrastructure is sufficient; do not add a second animation library without a concrete need.

Preserve `/work` and `/work/[slug]` as deeper destinations. The homepage is now the complete overview, not a gateway requiring a second page to complete the journey. At short viewport heights, show all seven checkpoints as compact progress dots with a native, keyboard-accessible chapter selector, rather than overlapping touch targets.

The original v1 requirements and source notes follow as historical context and engineering reference.

## Intent
Create a custom, premium, interactive software engineering portfolio that turns a quick scan into strong evidence of backend systems engineering, applied AI work, and production experience. The intended audience is recruiters, hiring managers, startup founders, and engineering peers. A first-time visitor must learn the role, strongest proof point, and how to contact Aayush within ~30 seconds.

## Ground truth and inputs
- Resume: supplied PDF `aayush_CV(2).pdf` (October 2026 version).
- GitHub: https://github.com/AAyushPatil195
- LinkedIn: https://www.linkedin.com/in/aayushpatil1905/
- User reference: https://portfolio-eight-olive-76.vercel.app/ (borrow content coverage, not its exact design).
- Design inspiration: https://dennissnellenberg.com/ (high-impact typography and transitions); https://rauno.me/ (micro-interaction craft); https://bruno-simon.com/ (playful discovery, not full-site 3D navigation); https://www.kobemichael.dev/ (clear engineering content and case studies).
- Photos, project screenshots, and available live demo endpoints require asset verification before publication. Never fabricate images or live demos.

## Creative thesis
**The Engineer's Playground** — refined editorial layout meets a responsive architecture visualization. Not a generic coding terminal, crowded bento grid, or game that blocks information.

Signature detail: a minimal interactive node-network in hero. On scroll, links/vertices compress and resolve into a clean, annotated architecture visualization for the featured QuickShow case study. Provide static illustration fallback on weak devices or reduced motion. This is decorative progression, not the only way to access content.

## Tone and copy
Brand line: "I build systems. Then make them better."
H1: Aayush Patil
Role label: "Software Engineer / Backend Systems & Applied AI"
Intro: "I build reliable backends, thoughtful products, and AI-powered tools—then measure how they behave under real-world conditions."
CTAs: "Explore work", "Download résumé", "Let's talk".
Voice: precise, curious, unpretentious. Avoid inflated claims, AI-marketing copy, or frontend-only positioning.

## Visual system
- Base background: #10141A (dark graphite)
- Text on dark: #F3F3EF (warm off-white)
- Accent: #CFFF77 (electric lime, used sparingly)
- Secondary accent: #8BADD0 (steel blue)
- Light-section background: #F4F1E9 (warm ivory)
- Supporting dark surface: #1D2530
- Typography: expressive sans display (Space Grotesk or equivalent), highly legible body (Inter/Manrope), JetBrains Mono for precise labels. Check font licensing and serve efficiently.
- Grid: 12 columns on desktop, 4 on mobile; generous gutters; no gratuitous rounded-card framing.
- Use striking full-bleed selected project artwork, subtle grid or scanline texture only where it reinforces technical motifs, clear hierarchy, asymmetric sections, and strong contrast.

## Site structure and order
1. **Hero** — editorial title, concise one-line positioning, availability, selected social links, clear work CTA, responsive node visualization.
2. **Selected Work** — lead immediately with QuickShow (not a generic skills list); follow with Telecom Support Assistant and Time Capsule API; feature File Manager selectively. Each thumbnail opens a case-study route.
3. **Engineering Proof** — visually strong, responsibly labeled statistics: 12,750 QuickShow booking attempts; 45 passing load tests; zero unexpected errors in those runs; 91% improvement in p95 read latency in stated benchmark; 130+ API/UI/visual tests at BrowserStack. Explain the test environment and measurement methodology in the case study, never as an unqualified production SLA.
4. **Experience** — BrowserStack Jun 2025–Apr 2026; Finixia Dedecons Jan–Jun 2025. Timeline with scoped engineering contributions and tech. Do not share proprietary code or unapproved screenshots.
5. **Capabilities** — Backend Engineering, Distributed/Concurrent Systems, Applied AI, Frontend/Product Engineering. Minimal tags for stack, avoid 30 colorful skill pills.
6. **Now / Lab** — evolving work such as Wardro (active prototypes) and the Dr Ashok Patil website, clearly marked as in progress where applicable. Public-project screenshots need consent/review.
7. **About / Education / Achievements** — personal perspective, IIIT Nagpur CSE 2021–2025, 1,000+ DSA problems, relevant leadership achievements. College milestones belong here, not an enormous separate timeline.
8. **Contact** — oversized direct CTA, `mailto:` email, GitHub, LinkedIn; no unnecessary contact backend or unverified third-party form.

## Project case studies and source links

### 1. QuickShow / BookShow (flagship)
Repo: https://github.com/AAyushPatil195/BookShow
Source resume links to an older branch `seat-allocation-optimization`, but that ref could not be independently fetched; use the default repo until checked.
- Stack per résumé: React, Node.js, MongoDB, Redis, Kafka, Docker, Kubernetes; auth Clerk; payments Stripe; assistant via LangChain/FastAPI.
- Problem: prevent duplicate cinema seat allocation under concurrency, keep booking reliable, reduce read latency.
- Implementation highlights from résumé: atomic Redis seat locks, MongoDB transactions, unique seat allocations, caching with Redis cache-aside.
- Performance proof from résumé: 12,750 attempted bookings over 45 passing load tests with zero unexpected errors; 2,550/2,550 successful non-conflicting seat bookings with 100–500 concurrent requests; p95 read latency 44.94 -> 3.68 ms (91% reduction), k6 at 20 RPS across three runs.
- Interactive editorial components: clickable system diagram; seat allocation simulator clearly labeled as illustrative; comparison before/after latency visual. Simulate visuals in-browser without claiming they connect to production services.
- Sections: Problem / Architecture / Race Condition / Correctness / Benchmarks / Trade-offs / Code & Demo.
- Check live demo availability before adding public CTA. The frontend link present in the PDF was not verifiable by the browsing source at review time.

### 2. Telecom Support Assistant
Repo: https://github.com/AAyushPatil195/Telecom_Assistant
- RAG-powered telecom Q&A over FAQ, historical ticket database, and PDF documentation.
- Stack: Python, LangChain, Chroma, Streamlit, Groq, SQLite.
- Visual: retrieval flow diagram, example user question and grounded passage cards; sample content labeled as demo/mock data when not literally sourced from project.
- Explain grounding, handling missing context, trade-offs and evaluation honestly.

### 3. Time Capsule API
Repo: https://github.com/AAyushPatil195/Time-Capsule-API
- JWT-secured API, time locks, access control, pagination, scheduled expiry, Jest tests.
- Visual: interactive lifecycle timeline (Create → Lock → Unlock → Expire), without implying hosted live backend.

### 4. File Manager
Repo: https://github.com/AAyushPatil195/G-drive-
- User-scoped cloud file management, JWT, Multer uploads, Firebase Storage, signed download URLs.
- Show as secondary card unless strong screenshots are available.

### Work-in-progress showcase
- Wardro (prototype): https://github.com/AAyushPatil195/Vardro
- Wardo app, backend foundation and incomplete FE integration: https://github.com/AAyushPatil195/wardro-0.O
- Doctor website: https://github.com/AAyushPatil195/dr-ashok-patil-site
Only highlight verified current capabilities; mark unreleased features as WIP. Avoid exposing private data, model/API credentials, or family personal details beyond publicly approved contact.

## Experience details
BrowserStack — Software Development Engineer, Jun 2025–Apr 2026 (wording taken from current résumé; ensure it matches the user's preferred and factually accurate public title):
- fixed frontend UI defects and persistent backend bugs;
- built AI-assisted PR review and Jira progress agents;
- added frontend/backend unit tests;
- authored 130+ API/UI/visual regression tests (Jest, PactumJS, NightwatchJS, Percy);
- validated 11+ feature areas, investigated 17 RBAC defects + 25+ other bugs, supported multi-environment CI/release workflows.
Finixia Dedecons — Frontend Developer, Jan–Jun 2025: responsive React/Tailwind interfaces, REST API integration for Wens Force and Melo Films.

## Motion: restrained but memorable
- Loader: max ~600ms on repeat visits; ideally no blocking page-level preloader.
- Hero: orchestrated display text reveal, line-drawing of nodes, subtle pointer depth effect, nonblocking 60fps.
- Scroll: 1–2 reveal treatments used consistently, cinematic project card expansion and pinned section for QuickShow only; no scroll hijacking; native scrolling remains operable.
- Hover: magnetic CTA only on fine pointer, image parallax/crossfade, animated underlines, pill shifts, focus states with equivalent visibility.
- Project transition: shared-element crossfade when supported; otherwise immediate link with CSS transitions.
- Easter egg: optional keyboard command palette with quick links (/ or Ctrl+K), always accessible via visible navigation.
- Reduced-motion: respect `prefers-reduced-motion` by disabling parallax, inessential camera moves and long reveal sequences.
- Touch: no hover-only information. No tiny touch targets; prioritize actual responsiveness at 360/390/430/768/1024/1440 widths.

## Implementation stack
- Next.js App Router, TypeScript, Tailwind CSS.
- GSAP + ScrollTrigger for a small number of carefully tuned scroll stories; Motion (Framer Motion successor) for React state/layout transitions only as needed. Avoid redundant animation systems when simple CSS suffices.
- Optional Lenis only if thoroughly tested with anchor scrolling, keyboard, reduced motion, and ScrollTrigger; native scroll preferred if smoothness is adequate.
- Optional Three.js / react-three-fiber confined to progressive enhanced hero nodes, lazy-loaded and capped for GPU budget; SVG/Canvas may be simpler and faster.
- MDX or typed data files for case studies; static deployment, no database required.
- Deployment can use an existing preferred static Next.js host; never introduce paid infra just for animation.

## Performance, accessibility and SEO acceptance
- Target Lighthouse Performance >=90 on mobile under a representative test, accessibility >=95; targets, not existing achievements.
- Aim for LCP <=2.5s, CLS <=0.1 and INP <=200ms at p75 field measurement when available; measure on real devices.
- Accessible semantic headings, keyboard navigation, visible focus, skip link, contrast tested, alt text, hover/touch parity, reduced motion.
- Lazy-load hero visual enhancements after critical text; optimize actual screenshots with modern formats, responsive `sizes` and useful alt text.
- Proper sitemap, canonical URL, per-case-study metadata, Open Graph images, JSON-LD Person when correct, downloadable résumé with stable URL, social links.
- No invented GitHub contribution stats, private work detail, screenshots of unreleased apps, broken live links, fake testimonials or benchmark numbers.

## Recommended delivery plan
1. Create design system and three high-fidelity visual directions for hero + project browsing. Select direction before elaborate coding.
2. Build responsive static home page with actual resume content, authentic links, and project thumbnails.
3. Add QuickShow case study and its benchmark/architecture visualizations.
4. Add other case studies, experience, education, capabilities and contact.
5. Motion layer: GSAP only after layout/content stability. Reduced-motion and mobile alternatives simultaneously.
6. Capture and review at 360, 390, 768, 1024, 1440; keyboard and touchscreen; run accessibility/performance checks.
7. Deploy preview, audit real-world behavior, and then publish with final canonical domain.

## Critical principle
The animation must help a viewer understand Aayush's engineering thinking. Never let fancy motion obscure the hero, project explanations, links or contact route.
