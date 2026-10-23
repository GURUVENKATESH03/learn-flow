import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const geminiApiKey =
  process.env.GEMINI_API_KEY ||
  process.env.API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  '';

const ai = new GoogleGenAI(geminiApiKey ? { apiKey: geminiApiKey } : {});

// Helper to safely parse JSON from Gemini (stripping code fences)
function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.slice(7);
    } else if (clean.startsWith('```')) {
      clean = clean.slice(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.slice(0, -3);
    }
    return JSON.parse(clean.trim());
  } catch (e) {
    console.warn('safeJsonParse fallback used:', e);
    return fallback;
  }
}

// Domain-aware curriculum generator when offline or API call recovers
function buildIntelligentCurriculum(topic: string, timeframe: string = '8 weeks') {
  const lower = (topic || '').toLowerCase();
  const cleanTitle = topic.trim() || 'Software Engineering';

  if (lower.includes('spring') || lower.includes('java')) {
    return {
      title: `${cleanTitle} Architecture Mastery`,
      milestones: [
        {
          phase: 'Phase 1',
          title: 'Spring Boot 3 Core & REST APIs',
          status: 'Completed',
          progress: 100,
          weeks: 'Weeks 1-2',
          tasks: [
            'Master Inversion of Control (IoC) & Dependency Injection container',
            'Develop RESTful endpoints with validation & Global Exception Handling',
            'Configure Spring Data JPA with PostgreSQL / H2 test profiles',
          ],
        },
        {
          phase: 'Phase 2',
          title: 'Security, JWT & Distributed Caching',
          status: 'In Progress',
          progress: 55,
          weeks: 'Weeks 3-4',
          tasks: [
            'Implement Spring Security 6 FilterChain & stateless JWT authentication',
            'Integrate Redis distributed caching with @Cacheable & TTL expiration',
            'Write MockMvc unit tests and Testcontainers integration suites',
          ],
        },
        {
          phase: 'Phase 3',
          title: 'Microservices & Event-Driven Architecture',
          status: 'Upcoming',
          progress: 0,
          weeks: 'Weeks 5-6',
          tasks: [
            'Decouple services using Apache Kafka topics and event listeners',
            'Implement Saga pattern & circuit breakers using Resilience4j',
            'API Gateway routing, distributed tracing with OpenTelemetry & Zipkin',
          ],
        },
        {
          phase: 'Phase 4',
          title: 'Cloud Native & Production Hardening',
          status: 'Upcoming',
          progress: 0,
          weeks: 'Weeks 7-8',
          tasks: [
            'Build multi-stage Docker container images with GraalVM Native / JVM',
            'Kubernetes deployment manifests, liveness/readiness probes & ConfigMaps',
            'Prometheus & Grafana dashboards for JVM metrics & p99 latency alerts',
          ],
        },
      ],
    };
  }

  if (lower.includes('kafka') || lower.includes('event') || lower.includes('stream')) {
    return {
      title: `${cleanTitle} Event-Driven Architecture`,
      milestones: [
        {
          phase: 'Phase 1',
          title: 'Broker Architecture & Partitioning',
          status: 'Completed',
          progress: 100,
          weeks: 'Weeks 1-2',
          tasks: [
            'Understand commit log internals, topic partitions & segment files',
            'Build high-throughput Producer with idempotence & snappy compression',
            'Consumer Group rebalancing protocols and manual offset commit strategies',
          ],
        },
        {
          phase: 'Phase 2',
          title: 'Serialization, Schemas & Delivery Guarantees',
          status: 'In Progress',
          progress: 50,
          weeks: 'Weeks 3-4',
          tasks: [
            'Implement Confluent Schema Registry with Avro / Protobuf validation',
            'Achieve Exactly-Once Semantics (EOS) using transactional producers',
            'Dead letter queue (DLQ) design and poison pill error recovery',
          ],
        },
        {
          phase: 'Phase 3',
          title: 'Kafka Streams & KSQL Stateful Processing',
          status: 'Upcoming',
          progress: 0,
          weeks: 'Weeks 5-6',
          tasks: [
            'Stateful streaming aggregations, join semantics & sliding time windows',
            'State stores with RocksDB & changelog topic replication',
            'Interactive queries against local Kafka Streams application state',
          ],
        },
        {
          phase: 'Phase 4',
          title: 'Cluster Operations & Resiliency',
          status: 'Upcoming',
          progress: 0,
          weeks: 'Weeks 7-8',
          tasks: [
            'Deploy production multi-broker Kafka cluster with KRaft consensus',
            'Monitor consumer lag with Burrow & Prometheus JMX Exporter',
            'Zero-downtime rolling upgrades and cross-cluster MirrorMaker 2 replication',
          ],
        },
      ],
    };
  }

  if (lower.includes('vue') || lower.includes('frontend')) {
    return {
      title: `${cleanTitle} Frontend Engineering`,
      milestones: [
        {
          phase: 'Phase 1',
          title: 'Vue 3 Composition API & Tooling',
          status: 'Completed',
          progress: 100,
          weeks: 'Weeks 1-2',
          tasks: [
            'Master <script setup>, ref, reactive, computed & custom composables',
            'Setup Vite 5 toolchain with strict TypeScript & Tailwind CSS',
            'Component breakdown, two-way v-model contracts & custom events',
          ],
        },
        {
          phase: 'Phase 2',
          title: 'State Architecture & Routing',
          status: 'In Progress',
          progress: 60,
          weeks: 'Weeks 3-4',
          tasks: [
            'Pinia modular stores with state persistence & getters',
            'Vue Router 4 with dynamic nested routes & auth navigation guards',
            'Form validation with VeeValidate & Zod schema contracts',
          ],
        },
        {
          phase: 'Phase 3',
          title: 'Performance & Offline PWA',
          status: 'Upcoming',
          progress: 0,
          weeks: 'Weeks 5-6',
          tasks: [
            'Component code splitting, async defineAsyncComponent & virtual scrolling',
            'Offline caching with service workers & Web Storage sync',
            'Unit and component testing with Vitest & Vue Test Utils',
          ],
        },
        {
          phase: 'Phase 4',
          title: 'Production Build & Nuxt SSR',
          status: 'Upcoming',
          progress: 0,
          weeks: 'Weeks 7-8',
          tasks: [
            'Server-Side Rendering (SSR) & Static Site Generation with Nuxt 3',
            'Automated CI/CD build pipelines and Lighthouse performance optimization',
            'Zero-bundle regressions and production CDN cache headers',
          ],
        },
      ],
    };
  }

  if (lower.includes('docker') || lower.includes('k8s') || lower.includes('kubernetes') || lower.includes('devops')) {
    return {
      title: `${cleanTitle} DevOps & Cloud Platform Track`,
      milestones: [
        {
          phase: 'Phase 1',
          title: 'Containerization & Image Optimization',
          status: 'Completed',
          progress: 100,
          weeks: 'Weeks 1-2',
          tasks: [
            'Multi-stage Dockerfile builds with minimal Alpine/Distroless bases',
            'Docker Compose multi-container local microservice orchestration',
            'Container security scans with Trivy and non-root execution',
          ],
        },
        {
          phase: 'Phase 2',
          title: 'Kubernetes Core Architecture',
          status: 'In Progress',
          progress: 45,
          weeks: 'Weeks 3-4',
          tasks: [
            'Deployments, ReplicaSets, Pods, ConfigMaps & Secrets management',
            'Cluster networking, ClusterIP, NodePort & Ingress controllers',
            'PersistentVolumeClaims (PVC) and StatefulSets storage patterns',
          ],
        },
        {
          phase: 'Phase 3',
          title: 'Helm & GitOps Continuous Delivery',
          status: 'Upcoming',
          progress: 0,
          weeks: 'Weeks 5-6',
          tasks: [
            'Package microservices into reusable Helm 3 charts with values schema',
            'Implement GitOps automated deployments with ArgoCD / Flux',
            'Zero-downtime rolling releases & canary deployment routing',
          ],
        },
        {
          phase: 'Phase 4',
          title: 'Observability & Cluster Hardening',
          status: 'Upcoming',
          progress: 0,
          weeks: 'Weeks 7-8',
          tasks: [
            'Prometheus metrics scraping, Alertmanager rules & Grafana dashboards',
            'Centralized log aggregation with Loki and distributed tracing',
            'Role-Based Access Control (RBAC), NetworkPolicies & resource quotas',
          ],
        },
      ],
    };
  }

  // Universal dynamic fallback matching the exact title
  return {
    title: `${cleanTitle} Mastery Program`,
    milestones: [
      {
        phase: 'Phase 1',
        title: `${cleanTitle} Foundations & Environment Setup`,
        status: 'In Progress',
        progress: 30,
        weeks: 'Weeks 1-2',
        tasks: [
          `Setup development toolchain, linters, and runtime for ${cleanTitle}`,
          `Master core architecture, syntax fundamentals & paradigm primitives`,
          `Build initial "Hello World" proof-of-concept prototype`,
        ],
      },
      {
        phase: 'Phase 2',
        title: `${cleanTitle} Architecture Patterns & Implementation`,
        status: 'Upcoming',
        progress: 0,
        weeks: 'Weeks 3-4',
        tasks: [
          `Implement domain abstractions, separation of concerns & state sync`,
          `Integrate unit test suites & automated integration contracts`,
          `Build resilient error boundaries and input validation pipelines`,
        ],
      },
      {
        phase: 'Phase 3',
        title: `${cleanTitle} Scaling, Security & Integration`,
        status: 'Upcoming',
        progress: 0,
        weeks: 'Weeks 5-6',
        tasks: [
          `High-throughput caching layer & query performance tuning`,
          `Asynchronous event streaming & external API contracts`,
          `Security hardening, authentication tokens, and access roles`,
        ],
      },
      {
        phase: 'Phase 4',
        title: `${cleanTitle} Production Deployment & Observability`,
        status: 'Upcoming',
        progress: 0,
        weeks: 'Weeks 7-8',
        tasks: [
          `Docker containerization & multi-stage deployment build pipeline`,
          `Real-time observability, health telemetry & structured logging`,
          `Run load testing benchmarks and deploy to live production cluster`,
        ],
      },
    ],
  };
}

// Status check route for AI capabilities
app.get('/api/ai/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    model: 'gemini-3.8-flash',
    hasApiKey: Boolean(geminiApiKey),
    platform: 'LearnFlow AI Engine',
  });
});

// 1. AI Explorer Chat Route
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, context = '' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const systemPrompt = `You are LearnFlow AI, an intelligent, encouraging, and highly technical mobile learning companion for developers and engineers. 
The user is Guru, a software developer focusing on Java, Spring Boot, Vue.js, Distributed Systems, Microservices, and Cloud Native architecture.
Provide concise, mobile-friendly responses (use clear bullet points, brief code snippets where helpful, and high-signal advice). 
Format text clearly with clean paragraphs and lists. Keep responses under 250 words so they read beautifully on a mobile phone screen.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nContext:\n${context}\n\nUser Question: ${message}` }],
      },
    ];

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timeout')), 8000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
    const reply = response.text || "I couldn't process that query. Let's try another topic!";
    res.json({ reply, model: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('Gemini chat API error:', err?.message || err);

    // High-signal intelligent contextual answer for Guru's engineering stack
    let responseText = '';
    const qLower = message.toLowerCase();

    if (qLower.includes('sql') && qLower.includes('nosql')) {
      responseText = `### SQL vs NoSQL: Engineering Trade-offs

1. **SQL (Relational):**
   - Tables with strict ACID guarantees.
   - Ideal for financial transactions, billing, and relational business domains.
   - Fits **Spring Data JPA** / Hibernate with PostgreSQL or MySQL.

2. **NoSQL (Non-Relational):**
   - Document / Key-Value models following BASE (eventual consistency).
   - High write throughput and flexible schemaless ingestion.
   - Fits **Spring Data MongoDB** or **Redis** caching.

**Architecture Rule of Thumb:** Use Polyglot Persistence! Store core entities in PostgreSQL and cache high-frequency read streams in Redis.`;
    } else if (qLower.includes('clean architecture') || qLower.includes('architecture')) {
      responseText = `### Clean Architecture Core Principles

1. **Domain Core (Entities):**
   - Enterprise business logic with zero framework dependencies.
2. **Use Cases (Interactors):**
   - Orchestrates data flow between Domain and Ports.
3. **Interface Adapters:**
   - Controllers, Presenters, Gateways (Spring MVC, REST endpoints).
4. **Frameworks & Drivers:**
   - Database (Postgres), Web server, UI (Vue.js).

**Key Benefit:** Business rules can be thoroughly tested in isolation without needing live databases or network mocks!`;
    } else {
      responseText = `Regarding "${message}":
- **Core Architecture:** Keep domain entities decoupled from delivery mechanisms.
- **Microservices Boundary:** Ensure independent deployability and asynchronous events via Kafka.
- **Spring Boot & Vue:** Use stateless JWT authentication and type-safe REST contracts.

Let me know if you would like a code snippet, architectural diagram, or quick quiz on this!`;
    }

    res.json({
      reply: responseText,
      model: 'learnflow-synthesizer',
    });
  }
});

// 2. Dynamic Roadmap Generator Route
app.post('/api/ai/generate-roadmap', async (req: Request, res: Response) => {
  const { topic, timeframe = '8 weeks', currentLevel = 'Intermediate' } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const prompt = `Generate a structured, highly realistic learning roadmap for a developer mastering: "${topic}". 
Timeframe: ${timeframe}, Current level: ${currentLevel}.
Return JSON only matching this exact format:
{
  "title": "Descriptive title for ${topic} Track",
  "milestones": [
    {
      "phase": "Phase 1",
      "title": "Specific title tailored to ${topic} basics",
      "status": "In Progress",
      "progress": 25,
      "weeks": "Weeks 1-2",
      "tasks": ["Specific task 1 for ${topic}", "Specific task 2 for ${topic}", "Specific task 3 for ${topic}"]
    },
    {
      "phase": "Phase 2",
      "title": "Intermediate ${topic} architecture",
      "status": "Upcoming",
      "progress": 0,
      "weeks": "Weeks 3-4",
      "tasks": ["Advanced ${topic} pattern", "Testing & security for ${topic}", "Data validation pipeline"]
    },
    {
      "phase": "Phase 3",
      "title": "${topic} Distributed Scaling & Resiliency",
      "status": "Upcoming",
      "progress": 0,
      "weeks": "Weeks 5-6",
      "tasks": ["High-throughput optimization", "Message queue / event integration", "Caching & concurrency"]
    },
    {
      "phase": "Phase 4",
      "title": "Production Cloud & CI/CD Deployment",
      "status": "Upcoming",
      "progress": 0,
      "weeks": "Weeks 7-8",
      "tasks": ["Containerization with Docker", "Observability, metrics & logging", "Production release pipeline"]
    }
  ]
}
Do not use markdown wrappers. Ensure all milestones and tasks are deeply technical and explicitly mention "${topic}".`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timeout')), 7000)
    );

    const fallback = buildIntelligentCurriculum(topic, timeframe);
    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
    const parsed = safeJsonParse(response.text || '', fallback);
    res.json(parsed);
  } catch (err: any) {
    console.error('Roadmap generation error:', err?.message || err);
    const fallbackCurriculum = buildIntelligentCurriculum(topic, timeframe);
    res.json(fallbackCurriculum);
  }
});

// 3. Quiz & Flashcard Generator Route
app.post('/api/ai/generate-quiz', async (req: Request, res: Response) => {
  const { topic, noteContent } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        topic: topic || 'Kafka Basics',
        questions: [
          {
            id: 'q1',
            question: 'What is the primary role of a Partition in Apache Kafka?',
            options: [
              'To store client authentication tokens',
              'To allow horizontal parallelism and topic scaling',
              'To automatically translate JSON to XML',
              'To encrypt messages at rest'
            ],
            correctIndex: 1,
            explanation: 'Partitions divide topics into independent ordered logs, enabling multiple consumers to read in parallel.'
          },
          {
            id: 'q2',
            question: 'In Spring Boot Security, which filter typically intercepts JWT tokens?',
            options: [
              'CorsFilter only',
              'OncePerRequestFilter custom JWT filter',
              'BasicAuthenticationFilter only',
              'DefaultLoginPageGeneratingFilter'
            ],
            correctIndex: 1,
            explanation: 'OncePerRequestFilter ensures the JWT token validation logic executes once per incoming HTTP request.'
          },
          {
            id: 'q3',
            question: 'Why are B-Tree indexes preferred over Hash indexes for database queries with range filters?',
            options: [
              'Hash indexes consume no memory',
              'B-Tree preserves order allowing O(log N) range scans',
              'Hash indexes do not support integers',
              'B-Tree indexes are purely in-memory'
            ],
            correctIndex: 1,
            explanation: 'B-Tree stores keys in sequential order, making queries like WHERE age BETWEEN 20 AND 30 extremely efficient.'
          }
        ]
      });
    }

    const prompt = `Generate a 3-question interactive multiple choice quiz for a software engineer based on this topic: "${topic}" and note: "${noteContent || ''}".
Return JSON in this format:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this answer is correct"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const quiz = JSON.parse(response.text || '{}');
    res.json(quiz);
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    res.json({
      topic: topic || 'Developer Knowledge',
      questions: [
        {
          id: 'q1',
          question: `What is a core benefit of mastering ${topic || 'system architecture'}?`,
          options: [
            'Better fault tolerance and scalable systems',
            'No need to write unit tests',
            'Unlimited free cloud computing',
            'Instant 100% bug-free deployments'
          ],
          correctIndex: 0,
          explanation: 'Understanding architecture enables building reliable, fault-tolerant, and performant systems.'
        }
      ]
    });
  }
});

// 4. Note AI Exploration & Relationship Generator
app.post('/api/ai/explore-note', async (req: Request, res: Response) => {
  const { title, content } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        summary: `Key takeaways from "${title}": foundational concepts, security considerations, and production deployment tips.`,
        relatedTopics: ['OAuth 2.0 & OpenID', 'Stateless Session Management', 'Redis Token Blacklisting'],
        mindMapNodes: [
          { id: '1', label: title, type: 'root' },
          { id: '2', label: 'Token Generation', type: 'concept' },
          { id: '3', label: 'Validation Filter', type: 'concept' },
          { id: '4', label: 'Secret Key Rotation', type: 'practice' },
        ],
      });
    }

    const prompt = `Analyze this technical note:
Title: "${title}"
Content: "${content}"

Return JSON:
{
  "summary": "1-2 sentence key takeaway",
  "relatedTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "mindMapNodes": [
    { "id": "1", "label": "Center concept", "type": "root" },
    { "id": "2", "label": "Sub-concept 1", "type": "concept" },
    { "id": "3", "label": "Sub-concept 2", "type": "concept" },
    { "id": "4", "label": "Practical application", "type": "practice" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    res.json({
      summary: `Note analysis for ${title}. Highlights core patterns, architecture considerations, and performance insights.`,
      relatedTopics: ['API Security', 'Distributed Cache', 'Database Indexing'],
      mindMapNodes: [
        { id: '1', label: title, type: 'root' },
        { id: '2', label: 'Core Mechanism', type: 'concept' },
        { id: '3', label: 'Configuration', type: 'concept' },
        { id: '4', label: 'Testing & Verification', type: 'practice' },
      ],
    });
  }
});

// Helper for dynamic keyword tag generation based on note title
function extractServerTags(title: string = '', content: string = ''): string[] {
  const combined = `${title} ${content}`.toLowerCase();
  const matched: string[] = [];

  const techDictionary: [RegExp, string][] = [
    [/\breact\b/i, 'React'],
    [/\bvue(\.js)?\b/i, 'Vue.js'],
    [/\bangular\b/i, 'Angular'],
    [/\bnext(\.js)?\b/i, 'Next.js'],
    [/\bsvelte\b/i, 'Svelte'],
    [/\btailwind(\s?css)?\b/i, 'Tailwind CSS'],
    [/\bspring(\s?boot)?\b/i, 'Spring Boot'],
    [/\bjava\b/i, 'Java'],
    [/\bnode(\.js)?\b/i, 'Node.js'],
    [/\bpython\b/i, 'Python'],
    [/\bgo(lang)?\b/i, 'Go'],
    [/\brust\b/i, 'Rust'],
    [/\btypescript\b/i, 'TypeScript'],
    [/\bjavascript\b/i, 'JavaScript'],
    [/\bsql\b/i, 'SQL'],
    [/\bnosql\b/i, 'NoSQL'],
    [/\bpostgres(ql)?\b/i, 'PostgreSQL'],
    [/\bmysql\b/i, 'MySQL'],
    [/\bmongo(db)?\b/i, 'MongoDB'],
    [/\bredis\b/i, 'Redis'],
    [/\bcassandra\b/i, 'Cassandra'],
    [/\bmicroservices?\b/i, 'Microservices'],
    [/\bdistributed(\s?systems?)?\b/i, 'Distributed Systems'],
    [/\bclean\s?architecture\b/i, 'Clean Architecture'],
    [/\bkafka\b/i, 'Kafka'],
    [/\brabbitmq\b/i, 'RabbitMQ'],
    [/\bevent-?driven\b/i, 'Event-Driven'],
    [/\bapi\b/i, 'API'],
    [/\brest(ful)?\b/i, 'REST API'],
    [/\bgraphql\b/i, 'GraphQL'],
    [/\bdocker\b/i, 'Docker'],
    [/\bkubernetes|k8s\b/i, 'Kubernetes'],
    [/\bci\/?cd\b/i, 'CI/CD'],
    [/\bdevops\b/i, 'DevOps'],
    [/\btesting|unit\s?tests?\b/i, 'Testing'],
    [/\bsecurity|auth|jwt|oauth\b/i, 'Security'],
    [/\bjpa|hibernate\b/i, 'JPA / ORM'],
  ];

  for (const [regex, tag] of techDictionary) {
    if (regex.test(combined) && !matched.includes(tag)) {
      matched.push(tag);
      if (matched.length >= 4) break;
    }
  }

  if (matched.length === 0 && title.trim()) {
    const stopWords = new Set(['the', 'and', 'for', 'with', 'how', 'what', 'why', 'in', 'on', 'at', 'to', 'of', 'a', 'an', 'is', 'vs', 'or']);
    const words = title
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()));

    for (const w of words) {
      const capitalized = w.charAt(0).toUpperCase() + w.slice(1);
      if (!matched.includes(capitalized)) {
        matched.push(capitalized);
      }
      if (matched.length >= 3) break;
    }
  }

  return matched.length > 0 ? matched : ['General', 'Engineering'];
}

// 5. Dynamic Note Auto-Tagger Route
app.post('/api/ai/auto-tag', async (req: Request, res: Response) => {
  const { title = '', content = '' } = req.body;

  if (!title.trim() && !content.trim()) {
    return res.json({ tags: ['General'] });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ tags: extractServerTags(title, content) });
    }

    const prompt = `Analyze this note title: "${title}" and note excerpt: "${content.slice(0, 300)}".
Generate 3 to 5 concise, professional tech tags strictly based on the note title and topic.
Return JSON ONLY as an array of string tags, e.g. ["Tag1", "Tag2", "Tag3"]. No other text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return res.json({ tags: parsed.slice(0, 5) });
    }
    return res.json({ tags: extractServerTags(title, content) });
  } catch (err: any) {
    console.warn('Auto-tag Gemini route notice:', err?.message || err);
    return res.json({ tags: extractServerTags(title, content) });
  }
});

// Helper: Format ISO date string into human-friendly relative time
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'recently';
  const past = new Date(dateString);
  if (isNaN(past.getTime())) return 'recently';
  const now = new Date();
  const diffSec = Math.max(1, Math.floor((now.getTime() - past.getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.floor(diffMonth / 12)}y ago`;
}

// 5. GitHub OAuth & Synchronization Routes

// 5a. GitHub Status & Config info
app.get('/api/github/status', (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID || null;
  const isConfigured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  const appUrl = process.env.APP_URL || 'https://ais-dev-vrgxfm6f3mx7ihazno7fpo-277658402725.asia-southeast1.run.app';
  res.json({
    configured: isConfigured,
    clientId,
    callbackUrl: `${appUrl}/auth/callback`,
    hasServerToken: Boolean(process.env.GITHUB_TOKEN),
  });
});

// 5b. Get GitHub OAuth Authorization URL for Popup
app.get('/api/github/auth-url', (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.APP_URL || 'https://ais-dev-vrgxfm6f3mx7ihazno7fpo-277658402725.asia-southeast1.run.app';
  const clientOrigin = (req.query.origin as string) || appUrl;
  const redirectUri = `${clientOrigin}/auth/callback`;

  if (!clientId) {
    return res.status(400).json({
      error: 'GITHUB_CLIENT_ID is not configured in environment variables. You can still link using a Personal Access Token or GitHub username.',
    });
  }

  const state = Math.random().toString(36).substring(2, 15);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,read:user',
    state,
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.json({ url: authUrl, redirectUri });
});

// 5c. OAuth Callback Handler with postMessage
const handleGitHubCallback = async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>GitHub Authentication Failed</title></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#f87171;padding:40px;text-align:center;">
          <h3>Authentication Canceled or Failed</h3>
          <p style="color:#94a3b8;font-size:14px;">${error || 'No authorization code returned.'}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: '${error || 'canceled'}' }, '*');
              setTimeout(() => window.close(), 1200);
            }
          </script>
        </body>
      </html>
    `);
  }

  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Server missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
    }

    // Exchange code for GitHub access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'LearnFlow-App',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData: any = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code');
    }

    // Fetch user info from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'LearnFlow-App',
      },
    });

    const userData: any = await userRes.json();

    // Send postMessage to parent opener and close popup window
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>GitHub Connected</title></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#fff;padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;height:80vh;">
          <div style="background:#1e293b;padding:24px 32px;border-radius:20px;border:1px solid #334155;max-width:360px;">
            <div style="font-size:36px;margin-bottom:12px;">🎉</div>
            <h3 style="margin:0 0 8px 0;font-size:18px;">Connected to @${userData.login || 'GitHub'}</h3>
            <p style="color:#94a3b8;font-size:13px;margin:0;">Returning to LearnFlow...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GITHUB_OAUTH_SUCCESS',
                  token: ${JSON.stringify(accessToken)},
                  user: ${JSON.stringify({
                    login: userData.login,
                    name: userData.name || userData.login,
                    avatar_url: userData.avatar_url,
                    html_url: userData.html_url,
                    public_repos: userData.public_repos,
                    total_private_repos: userData.total_private_repos || 0,
                  })}
                }, '*');
                setTimeout(() => window.close(), 600);
              } else {
                window.location.href = '/';
              }
            } catch (e) {
              console.error('PostMessage error:', e);
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('GitHub OAuth Exchange error:', err);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>GitHub OAuth Error</title></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#f87171;padding:40px;text-align:center;">
          <h3>GitHub Authentication Failed</h3>
          <p style="color:#94a3b8;font-size:13px;">${err.message || 'Error communicating with GitHub'}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: '${err.message}' }, '*');
              setTimeout(() => window.close(), 2500);
            }
          </script>
        </body>
      </html>
    `);
  }
};

app.get(['/auth/callback', '/auth/callback/', '/api/github/callback'], handleGitHubCallback);

// 5d. Get GitHub User Profile (via token or username)
app.get('/api/github/user', async (req: Request, res: Response) => {
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || (req.query.token as string))?.trim();
  const username = (req.query.username as string)?.trim();

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'LearnFlow-App',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = token ? 'https://api.github.com/user' : `https://api.github.com/users/${encodeURIComponent(username || '')}`;
    if (!token && !username) {
      return res.status(400).json({ error: 'Either token or username must be provided' });
    }

    const ghRes = await fetch(url, { headers });
    if (!ghRes.ok) {
      const errBody: any = await ghRes.json().catch(() => ({}));
      return res.status(ghRes.status).json({ error: errBody.message || 'GitHub user request failed' });
    }

    const user: any = await ghRes.json();
    res.json({
      login: user.login,
      name: user.name || user.login,
      avatarUrl: user.avatar_url,
      htmlUrl: user.html_url,
      bio: user.bio || '',
      publicRepos: user.public_repos || 0,
      totalPrivateRepos: user.total_private_repos || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user' });
  }
});

// 5e. Get GitHub Repositories (list user's repos)
app.get('/api/github/repos', async (req: Request, res: Response) => {
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || (req.query.token as string))?.trim();
  const username = (req.query.username as string)?.trim();

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'LearnFlow-App',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // If authenticated via token, fetch user's full repos including private
    const url = token
      ? 'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator'
      : `https://api.github.com/users/${encodeURIComponent(username || '')}/repos?per_page=100&sort=updated`;

    if (!token && !username) {
      return res.status(400).json({ error: 'Token or username is required' });
    }

    const ghRes = await fetch(url, { headers });
    if (!ghRes.ok) {
      const errBody: any = await ghRes.json().catch(() => ({}));
      return res.status(ghRes.status).json({ error: errBody.message || 'GitHub repositories request failed' });
    }

    const repos: any = await ghRes.json();
    if (!Array.isArray(repos)) {
      return res.json([]);
    }

    const formatted = repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description || '',
      private: Boolean(r.private),
      htmlUrl: r.html_url,
      language: r.language || 'Code',
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      updatedAt: r.updated_at || new Date().toISOString(),
      defaultBranch: r.default_branch || 'main',
      openIssuesCount: r.open_issues_count || 0,
      owner: r.owner?.login,
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list repositories' });
  }
});

// 5f. Get Repository Commits & Open Pull Requests
app.get('/api/github/repo-details', async (req: Request, res: Response) => {
  const owner = req.query.owner as string;
  const repo = req.query.repo as string;
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || (req.query.token as string))?.trim();

  if (!owner || !repo) {
    return res.status(400).json({ error: 'Owner and repo are required' });
  }

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'LearnFlow-App',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // 1. Fetch Commits (last 20)
    const commitsPromise = fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=20`, { headers })
      .then(async (r) => {
        if (!r.ok) return [];
        const raw = await r.json();
        return Array.isArray(raw)
          ? raw.map((c: any) => ({
              id: c.sha,
              hash: c.sha.substring(0, 7),
              message: (c.commit?.message || 'Update').split('\n')[0],
              author: c.commit?.author?.name || c.author?.login || 'Committer',
              authorAvatar: c.author?.avatar_url,
              timeAgo: formatTimeAgo(c.commit?.author?.date || c.commit?.committer?.date),
              branch: 'main',
              url: c.html_url,
            }))
          : [];
      })
      .catch(() => []);

    // 2. Fetch Open Pull Requests (state=open)
    const prsPromise = fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=open&per_page=20&sort=updated&direction=desc`, { headers })
      .then(async (r) => {
        if (!r.ok) return [];
        const raw = await r.json();
        return Array.isArray(raw)
          ? raw.map((pr: any) => ({
              id: pr.id,
              number: pr.number,
              title: pr.title,
              state: pr.state,
              author: pr.user?.login || 'Contributor',
              authorAvatar: pr.user?.avatar_url,
              createdAt: pr.created_at,
              timeAgo: formatTimeAgo(pr.created_at),
              htmlUrl: pr.html_url,
              commentsCount: pr.comments || 0,
              draft: Boolean(pr.draft),
              labels: (pr.labels || []).map((l: any) => l.name),
              headBranch: pr.head?.ref,
              baseBranch: pr.base?.ref,
            }))
          : [];
      })
      .catch(() => []);

    // 3. Fetch Repository General Info
    const repoInfoPromise = fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { headers })
      .then(async (r) => {
        if (!r.ok) return null;
        return await r.json();
      })
      .catch(() => null);

    const [commits, pullRequests, repoInfo] = await Promise.all([commitsPromise, prsPromise, repoInfoPromise]);

    res.json({
      commits,
      pullRequests,
      defaultBranch: repoInfo?.default_branch || 'main',
      stars: repoInfo?.stargazers_count ?? 0,
      forks: repoInfo?.forks_count ?? 0,
      openIssuesCount: repoInfo?.open_issues_count ?? 0,
      topics: repoInfo?.topics || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch repository details' });
  }
});

// 5g. Sync/Convert GitHub Repo into a complete LearnFlow Project with Commits & PRs
app.post('/api/github/sync-repo', async (req: Request, res: Response) => {
  const { repo, token, username } = req.body;

  if (!repo || !repo.name) {
    return res.status(400).json({ error: 'Repository payload is required' });
  }

  const owner = repo.owner || repo.fullName?.split('/')[0] || username || 'owner';
  const repoName = repo.name;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'LearnFlow-App',
  };
  const activeToken = token || (process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN : null);
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  try {
    // Fetch live commits
    const commitsRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/commits?per_page=15`, { headers }).catch(() => null);
    const rawCommits = commitsRes && commitsRes.ok ? await commitsRes.json() : [];
    const commits = Array.isArray(rawCommits)
      ? rawCommits.map((c: any) => ({
          id: c.sha,
          hash: c.sha.substring(0, 7),
          message: (c.commit?.message || 'Update').split('\n')[0],
          author: c.commit?.author?.name || c.author?.login || username || 'Committer',
          authorAvatar: c.author?.avatar_url,
          timeAgo: formatTimeAgo(c.commit?.author?.date || c.commit?.committer?.date),
          branch: repo.defaultBranch || 'main',
          url: c.html_url,
        }))
      : [];

    // Fetch live open pull requests
    const prsRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/pulls?state=open&per_page=15&sort=updated`, { headers }).catch(() => null);
    const rawPrs = prsRes && prsRes.ok ? await prsRes.json() : [];
    const pullRequests = Array.isArray(rawPrs)
      ? rawPrs.map((pr: any) => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          author: pr.user?.login || 'Contributor',
          authorAvatar: pr.user?.avatar_url,
          createdAt: pr.created_at,
          timeAgo: formatTimeAgo(pr.created_at),
          htmlUrl: pr.html_url,
          commentsCount: pr.comments || 0,
          draft: Boolean(pr.draft),
          labels: (pr.labels || []).map((l: any) => l.name),
          headBranch: pr.head?.ref,
          baseBranch: pr.base?.ref,
        }))
      : [];

    // Smart milestones / tasks based on repository activity and commit status
    const tasks = [
      { id: `t-${Date.now()}-1`, text: 'Initial repository setup & branching configuration', done: commits.length > 0 },
      { id: `t-${Date.now()}-2`, text: 'Implement core modules and unit test coverage', done: commits.length >= 3 },
      { id: `t-${Date.now()}-3`, text: 'Review pull requests and code review comments', done: pullRequests.length === 0 },
      { id: `t-${Date.now()}-4`, text: 'Setup continuous integration and release pipeline', done: false },
    ];
    const completedTasks = tasks.filter((t) => t.done).length;
    const progress = Math.round((completedTasks / tasks.length) * 100);

    const project = {
      id: `gh-${repo.id || Date.now()}`,
      title: repo.name.split(/[-_]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: repo.description || 'Imported from GitHub repository with live sync.',
      progress,
      tags: [repo.language || 'Code', repo.private ? 'Private' : 'OpenSource'],
      repoUrl: repo.htmlUrl,
      iconBg: repo.private ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-600' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600',
      iconColor: repo.private ? 'purple' : 'emerald',
      visibility: repo.private ? 'private' : 'public',
      stars: repo.stars ?? 0,
      forks: repo.forks ?? 0,
      isGitHubSynced: true,
      githubOwner: owner,
      githubRepo: repoName,
      defaultBranch: repo.defaultBranch || 'main',
      lastSyncedAt: new Date().toISOString(),
      commits,
      pullRequests,
      tasks,
      status: 'Active',
    };

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync repository' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const http = await import('http');
  const server = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`LearnFlow mobile server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
