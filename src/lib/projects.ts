export type VerifiedFrontend = {
  url: `https://${string}`;
  kind: 'frontend';
  verifiedAt: string;
};

export type Project = {
  slug: string;
  name: string;
  index: string;
  category: string;
  summary: string;
  stack: string[];
  repository: `https://github.com/${string}`;
  status: 'Source available' | 'In development';
  liveDemo?: VerifiedFrontend;
  problem: string;
  approach: { title: string; body: string }[];
  tradeoffs: string[];
  evidence: { label: string; url: string }[];
};

export const github = 'https://github.com/AAyushPatil195';
export const linkedin = 'https://www.linkedin.com/in/aayushpatil1905/';
export const benchmarkSource = `${github}/BookShow/blob/b536cb6d2140869cf0c5a992b9b2689c7a8689a1/benchmarks/README.md`;

// The source resume is private. Add only after explicit publication approval,
// inspection, and placement of an approved PDF in public/.
export const resume: { href: string; filename: string } | null = null;

// Demo actions require a verified frontend record. Repository homepages and API
// endpoints are deliberately not promoted into demo links automatically.
export const projects: Project[] = [
  {
    slug: 'quickshow', name: 'QuickShow', index: '01',
    category: 'Cinema booking / concurrency / correctness',
    summary: 'Cinema booking examined where it gets interesting: competing requests, ownership, and the moment a seat becomes yours.',
    stack: ['Node.js', 'Redis', 'MongoDB', 'React'],
    repository: `${github}/BookShow`, status: 'Source available',
    problem: 'Two requests can observe an available seat before either has finished booking it. The interesting problem is coordinating those attempts while keeping the booking record and seat ownership consistent.',
    approach: [
      { title: 'Coordinate the show', body: 'The benchmarking branch acquires a show-wide Redis lock with SET NX EX 15. A token-checked Lua release prevents a stale owner from releasing a newer lock.' },
      { title: 'Make the commitment atomic', body: 'A MongoDB withTransaction callback checks availability, writes seat ownership, and creates the booking in one transaction. MongoDB remains the allocation source of truth.' },
      { title: 'Inspect correctness separately', body: 'The isolated local benchmark checks committed bookings against seat ownership and duplicate (show, seat) pairs. Expected 409 conflicts are counted separately from unexpected failures.' },
      { title: 'Keep the test boundary explicit', body: 'The local test stack uses synthetic users and dedicated data stores. Payment, authentication-provider cost, email, and background event processing are outside that allocation benchmark.' },
    ],
    tradeoffs: [
      'A show-wide lock can reject requests for different seats on the same show. That coordination simplicity limits accepted throughput.',
      'The README documents low-load validation, including expiry and rollback checks. It does not establish production capacity, geographic latency, or failover behavior.',
      'No high-load performance results are claimed here. The portfolio simulation illustrates one same-seat outcome; it does not exercise the application or measure it.',
    ],
    evidence: [
      { label: 'Benchmark design, validation, and limitations', url: benchmarkSource },
      { label: 'Booking controller / benchmarking revision', url: `${github}/BookShow/blob/b536cb6d2140869cf0c5a992b9b2689c7a8689a1/server/controllers/bookingController.js` },
    ],
  },
  {
    slug: 'telecom-assistant', name: 'Telecom Support Assistant', index: '02',
    category: 'Applied AI / retrieval / grounded context',
    summary: 'A support assistant that retrieves from FAQs, resolved tickets, and PDF guides before generating an answer.',
    stack: ['Python', 'LangChain', 'Chroma', 'Groq', 'Streamlit'],
    repository: `${github}/Telecom_Assistant`, status: 'Source available',
    problem: 'Useful support answers need the relevant policy, a previous resolution, or a specific guide passage. The system brings those sources into the answer path instead of relying on the model’s prior knowledge alone.',
    approach: [
      { title: 'Keep the sources distinct', body: 'FAQs, resolved support tickets, and PDF guide chunks are ingested into separate persistent Chroma collections. Local Sentence Transformers embeddings support semantic retrieval.' },
      { title: 'Merge the retrieved context', body: 'The retriever requests up to three documents from each collection and concatenates them. The prompt formatter includes source labels with the retrieved passages.' },
      { title: 'Generate within a boundary', body: 'LangChain passes the question and context to a Groq-hosted model. The prompt instructs it to use the supplied context and acknowledge when that context is insufficient.' },
      { title: 'Offer two entry points', body: 'A Streamlit interface provides streamed responses and chat history; a lightweight command-line client offers another way to query the same pipeline.' },
    ],
    tradeoffs: [
      'Merging three retrieval lists is straightforward, but it does not by itself provide reranking, deduplication, or calibrated confidence.',
      'Prompt instructions are a grounding strategy, not a guarantee of factual correctness. No evaluated answer-accuracy or hallucination-rate result is claimed.',
      'The portfolio source explorer is an explanatory diagram. It does not invoke a model, retrieve live documents, or show actual generated answers.',
    ],
    evidence: [
      { label: 'Project documentation', url: `${github}/Telecom_Assistant/blob/main/README.md` },
      { label: 'Merged retrieval implementation', url: `${github}/Telecom_Assistant/blob/main/retriever.py` },
      { label: 'Prompt and generation chain', url: `${github}/Telecom_Assistant/blob/main/rag_chain.py` },
    ],
  },
  {
    slug: 'time-capsule-api', name: 'Time Capsule API', index: '03',
    category: 'Backend engineering / time-based access',
    summary: 'An API for messages that become readable later, with user ownership, unlock codes, and an explicit expiry lifecycle.',
    stack: ['Node.js', 'Express', 'SQLite', 'JWT', 'Jest'],
    repository: `${github}/Time-Capsule-API`, status: 'Source available',
    problem: 'A time-locked message needs more than a future date. Reads must account for the authenticated owner, unlock code, unlock time, and expiry; writes need their own lifecycle constraints.',
    approach: [
      { title: 'Associate every capsule with an owner', body: 'Authenticated routes use the JWT-derived user ID when selecting capsules. A generated unlock code provides an additional check on individual capsule reads and changes.' },
      { title: 'Make time part of the read path', body: 'The controller rejects an early read with 403 and an expired capsule with 410. A valid owner/code combination can read the capsule once its unlock time has passed.' },
      { title: 'Constrain changes before unlock', body: 'Update and delete handlers check ownership and unlock code, and reject changes after the capsule has unlocked. Listing uses pagination for user-scoped results.' },
      { title: 'Track expiry in the background', body: 'An in-process hourly scheduler marks capsules expired thirty days after unlock. The individual read path also checks the expiry date directly.' },
    ],
    tradeoffs: [
      'The scheduler runs inside the application process. A durable external scheduler would be a separate production design decision.',
      'Unlock codes currently travel in query parameters. Moving them out of URLs would reduce exposure through request logs and browser history.',
      'The inspected controller stores the message directly; no encryption-at-rest claim is made. The portfolio lifecycle is a local illustration, not a hosted API.',
    ],
    evidence: [
      { label: 'Project documentation and test instructions', url: `${github}/Time-Capsule-API/blob/main/README.md` },
      { label: 'Capsule controller', url: `${github}/Time-Capsule-API/blob/main/src/controllers/capsuleController.js` },
      { label: 'Expiry scheduler', url: `${github}/Time-Capsule-API/blob/main/src/utils/scheduler.js` },
    ],
  },
  {
    slug: 'file-manager', name: 'File Manager', index: '04',
    category: 'Storage / ownership / access control',
    summary: 'User-scoped file management with authenticated uploads and short-lived, signed download links.',
    stack: ['Express', 'MongoDB', 'Firebase Storage', 'JWT', 'Multer'],
    repository: `${github}/G-drive-`, status: 'Source available',
    problem: 'Knowing a file path should not be enough to download someone else’s file. The application needs to connect authentication, stored ownership, and temporary storage access.',
    approach: [
      { title: 'Attach ownership at upload', body: 'The authenticated upload route uses Multer and creates a MongoDB file record associated with the user ID from the verified session token.' },
      { title: 'Scope the file listing', body: 'The home route queries file records for the authenticated user and renders that personal listing through the EJS interface.' },
      { title: 'Check ownership before signing', body: 'The download route looks up the requested path together with the authenticated user ID. Only a matching record proceeds to Firebase Storage URL signing.' },
      { title: 'Keep the URL short-lived', body: 'The signed read URL is configured to expire after one minute. The browser is redirected to that temporary storage URL after the application’s ownership check.' },
    ],
    tradeoffs: [
      'A signed URL is temporary bearer access to the file. Its short lifetime limits exposure but does not replace the initial ownership check.',
      'The documented UI uses EJS, Tailwind, and Flowbite. This project is presented for its backend access flow rather than as a React application.',
      'The portfolio access diagram explains the route ordering. It does not upload a file or connect to Firebase.',
    ],
    evidence: [
      { label: 'Project documentation', url: `${github}/G-drive-/blob/main/README.md` },
      { label: 'Listing, upload, and download routes', url: `${github}/G-drive-/blob/main/routes/index.routes.js` },
    ],
  },
];

export const getProject = (slug: string) => projects.find(project => project.slug === slug);
