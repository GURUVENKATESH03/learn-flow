import { UserProfile, Note, Project, Roadmap, TaskItem } from '../types';

export const initialUser: UserProfile = {
  name: 'Guru',
  role: 'Java Developer',
  email: 'prakashgvp.dev03@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  streak: 12,
  totalNotes: 124,
  totalProjects: 8,
  weeklyGoals: {
    completed: 4,
    total: 6,
  },
};

export const initialTasks: TaskItem[] = [
  { id: 't1', text: 'Complete Kafka notes', completed: true, category: 'Learning' },
  { id: 't2', text: 'Implement login API', completed: true, category: 'Project' },
  { id: 't3', text: 'Read about Docker deployment', completed: false, category: 'Reading' },
  { id: 't4', text: 'Update project documentation', completed: false, category: 'Docs' },
  { id: 't5', text: 'Practice DSA problems', completed: false, category: 'Coding' },
];

export const initialNotes: Note[] = [
  {
    id: 'n1',
    title: 'JWT Authentication Flow',
    content: `### JWT Authentication in Spring Boot 3.x
1. **User Login**: Client submits credentials to \`/api/auth/login\`.
2. **AuthenticationManager**: Validates username & password against database.
3. **Token Issuance**: Server signs payload using HMAC-SHA256 (or RSA-256) secret key with expiry.
4. **Authorization Header**: Client attaches \`Bearer <jwt_token>\` on subsequent requests.
5. **SecurityFilterChain**: Custom \`JwtAuthenticationFilter\` intercepts request before \`UsernamePasswordAuthenticationFilter\` and sets \`SecurityContextHolder.getContext().setAuthentication(auth)\`.

\`\`\`java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Autowired
    private JwtService jwtService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) 
        throws ServletException, IOException {
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            String userEmail = jwtService.extractUsername(jwt);
            // Verify & set security context
        }
        chain.doFilter(req, res);
    }
}
\`\`\``,
    summary: 'Stateless session authentication with Spring Security 6 filter chain and token claims.',
    tags: ['Spring Boot', 'Security'],
    createdAt: '2026-10-09T08:00:00Z',
    updatedAt: '2026-10-09T08:00:00Z',
    timeAgo: '2h ago',
    color: 'teal',
    relatedNoteIds: ['n4'],
    mindMapNodes: [
      { id: 'm1', label: 'JWT Auth', type: 'root' },
      { id: 'm2', label: 'OncePerRequestFilter', type: 'concept' },
      { id: 'm3', label: 'Token Signature (HMAC)', type: 'concept' },
      { id: 'm4', label: 'SecurityContextHolder', type: 'practice' },
      { id: 'm5', label: 'Stateless Session', type: 'practice' },
    ],
  },
  {
    id: 'n2',
    title: 'Kafka Basics',
    content: `### Apache Kafka Architecture Fundamentals
- **Brokers**: Distributed cluster instances handling event logs.
- **Topics & Partitions**:
  - Topics are divided into partitions for horizontal scale.
  - Partitions guarantee ordering within themselves, but not across partitions.
- **Consumer Groups**:
  - Multiple consumers in the same group share topic partitions for balanced workload.
- **Acks Config**:
  - \`acks=0\`: fire and forget (fastest, lowest guarantee).
  - \`acks=1\`: leader broker received message.
  - \`acks=all\`: leader and all in-sync replicas (ISR) received message (highest durability).`,
    summary: 'Distributed log architecture, topic partitioning, offsets, and consumer group rebalancing.',
    tags: ['Distributed Systems', 'Messaging'],
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-08T10:00:00Z',
    timeAgo: '1d ago',
    color: 'amber',
    mindMapNodes: [
      { id: 'k1', label: 'Kafka Core', type: 'root' },
      { id: 'k2', label: 'Partitions & Offsets', type: 'concept' },
      { id: 'k3', label: 'Consumer Groups', type: 'concept' },
      { id: 'k4', label: 'Replication (ISR)', type: 'practice' },
    ],
  },
  {
    id: 'n3',
    title: 'Vue.js Components',
    content: `### Vue 3 Composition API Essentials
- **<script setup>**: Ergonomic syntax sugar for Composition API.
- **ref() vs reactive()**:
  - \`ref\` for primitives and objects (unwraps with \`.value\` in JS, automatic in template).
  - \`reactive\` for object references only.
- **provide / inject**: Avoid prop drilling across deep component hierarchies.
- **watchEffect**: Auto-tracks dependencies inside its callback.`,
    summary: 'Modern Vue 3 reactivity primitives, script setup syntax, and composition patterns.',
    tags: ['Frontend', 'Vue.js'],
    createdAt: '2026-10-07T12:00:00Z',
    updatedAt: '2026-10-07T12:00:00Z',
    timeAgo: '2d ago',
    color: 'emerald',
    mindMapNodes: [
      { id: 'v1', label: 'Vue 3', type: 'root' },
      { id: 'v2', label: 'Composition API', type: 'concept' },
      { id: 'v3', label: 'Reactivity (ref)', type: 'concept' },
      { id: 'v4', label: 'Teleport & Suspense', type: 'practice' },
    ],
  },
  {
    id: 'n4',
    title: 'REST API Best Practices',
    content: `### Production REST API Guidelines
1. **URI Naming**: Use plural nouns (\`/api/v1/orders\`, \`/api/v1/orders/{id}\`).
2. **HTTP Verbs**:
   - GET: Idempotent read.
   - POST: Resource creation.
   - PUT: Complete replace.
   - PATCH: Partial update.
   - DELETE: Removal.
3. **Status Codes**: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests.
4. **Pagination**: Keyset/cursor-based pagination for large datasets.`,
    summary: 'Standard HTTP methods, idempotency, status codes, and URI naming conventions.',
    tags: ['Backend', 'API Design'],
    createdAt: '2026-10-06T15:00:00Z',
    updatedAt: '2026-10-06T15:00:00Z',
    timeAgo: '3d ago',
    color: 'blue',
  },
  {
    id: 'n5',
    title: 'Database Indexing Notes',
    content: `### PostgreSQL Indexing & Optimization
- **B-Tree**: Default index type. Ideal for equality (\`=\`) and range queries (\`<, <=, >, >=\`).
- **Composite Index Order**: Always place the most selective or equality columns leftmost.
- **GIN (Generalized Inverted Index)**: High performance for JSONB keys, full-text search, and array containment.
- **EXPLAIN ANALYZE**: Essential to identify Sequential Scans (Seq Scan) vs Index Scan.`,
    summary: 'B-Tree vs GIN indexes, composite column ordering, and query planner analysis.',
    tags: ['PostgreSQL', 'Performance'],
    createdAt: '2026-10-05T14:00:00Z',
    updatedAt: '2026-10-05T14:00:00Z',
    timeAgo: '4d ago',
    color: 'emerald',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'p1',
    title: 'Food Saver Platform',
    description: 'A platform to reduce food waste by connecting donors and NGOs.',
    progress: 70,
    tags: ['Spring Boot', 'Vue.js', 'PostgreSQL'],
    repoUrl: 'https://github.com/guruvenkatesh/food-saver-platform',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600',
    iconColor: 'emerald',
    status: 'Active',
    tasks: [
      { id: 'f1', text: 'Implement Geo-distance NGO query', done: true },
      { id: 'f2', text: 'JWT Donor authentication & role guards', done: true },
      { id: 'f3', text: 'Real-time pickup notification via WebSockets', done: true },
      { id: 'f4', text: 'Automated email dispatch upon donation receipt', done: false },
      { id: 'f5', text: 'Admin analytics report generator', done: false },
    ],
    commits: [
      { id: 'c1', hash: 'e49a21b', message: 'feat: add geo-spatial bounding box for food listing', author: 'Guru', timeAgo: '3 hours ago', branch: 'main' },
      { id: 'c2', hash: '87bcf92', message: 'fix: handle concurrent reservation race conditions', author: 'Guru', timeAgo: '1 day ago', branch: 'main' },
      { id: 'c3', hash: '3a19dc0', message: 'chore: configure docker-compose for PostgreSQL & Redis', author: 'Guru', timeAgo: '3 days ago', branch: 'dev' },
    ],
  },
  {
    id: 'p2',
    title: 'Resume Analyzer',
    description: 'AI-powered resume analysis and job matching.',
    progress: 40,
    tags: ['Python', 'NLP', 'Machine Learning'],
    repoUrl: 'https://github.com/guruvenkatesh/resume-analyzer-ai',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600',
    iconColor: 'indigo',
    status: 'Active',
    tasks: [
      { id: 'r1', text: 'PDF text extraction pipeline', done: true },
      { id: 'r2', text: 'NER model for skills & certifications', done: true },
      { id: 'r3', text: 'Cosine similarity matching with job descriptions', done: false },
      { id: 'r4', text: 'FastAPI REST backend endpoints', done: false },
    ],
    commits: [
      { id: 'c4', hash: '91d84f1', message: 'feat: integrate spaCy NER for skill extraction', author: 'Guru', timeAgo: '2 days ago', branch: 'main' },
      { id: 'c5', hash: '12fa099', message: 'refactor: vectorize candidate profiles using sentence-transformers', author: 'Guru', timeAgo: '5 days ago', branch: 'ml-pipeline' },
    ],
  },
  {
    id: 'p3',
    title: 'Voice Text Reader',
    description: 'Raspberry Pi based text reader for visually impaired.',
    progress: 30,
    tags: ['Python', 'OpenCV', 'TTS'],
    repoUrl: 'https://github.com/guruvenkatesh/pi-voice-text-reader',
    iconBg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600',
    iconColor: 'rose',
    status: 'Active',
    tasks: [
      { id: 'v1', text: 'Camera capture pipeline via Picamera2', done: true },
      { id: 'v2', text: 'Tesseract OCR image preprocessing & thresholding', done: true },
      { id: 'v3', text: 'Offline TTS speech synthesis with eSpeak', done: false },
      { id: 'v4', text: 'Physical button push triggers', done: false },
    ],
    commits: [
      { id: 'c6', hash: '5b44ec7', message: 'feat: camera capture script with automated lighting adjust', author: 'Guru', timeAgo: '4 days ago', branch: 'main' },
    ],
  },
];

export const initialRoadmap: Roadmap = {
  id: 'rm-java',
  title: 'Java Backend Developer',
  roleTrack: 'Full Stack & Distributed Systems',
  currentWeek: 3,
  totalWeeks: 12,
  overallProgress: 25,
  milestones: [
    {
      phase: 'Phase 1',
      title: 'Core Java',
      status: 'Completed',
      progress: 100,
      weeks: 'Weeks 1-2',
      tasks: [
        'OOP Principles & Clean Code',
        'Collections Framework & Streams API',
        'Concurrency & Multithreading (Executors, Locks)',
        'JVM Memory Model & Garbage Collection Basics',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Spring Boot',
      status: 'In Progress',
      progress: 60,
      weeks: 'Weeks 3-5',
      tasks: [
        'Spring Core, Inversion of Control & Beans',
        'Spring Data JPA & Hibernate Entities',
        'Spring Boot Security & JWT Tokens',
        'RESTful API Exception Handling & Validations',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Database',
      status: 'Upcoming',
      progress: 0,
      weeks: 'Weeks 6-8',
      tasks: [
        'PostgreSQL Query Optimization & Indexing',
        'Database Transactions (ACID, Isolation Levels)',
        'Flyway / Liquibase DB Migrations',
        'Redis Caching Strategies',
      ],
    },
    {
      phase: 'Phase 4',
      title: 'Deployment',
      status: 'Upcoming',
      progress: 0,
      weeks: 'Weeks 9-12',
      tasks: [
        'Docker Containerization & Multi-stage builds',
        'CI/CD Pipelines with GitHub Actions',
        'Kafka Event Streaming & Microservices',
        'Kubernetes Cluster Deployment & Monitoring',
      ],
    },
  ],
};
