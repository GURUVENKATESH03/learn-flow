import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fallback helper if GEMINI_API_KEY is not set or API fails
const handleAIError = (res: Response, fallbackData: any, error?: any) => {
  console.warn('Gemini API call notice/fallback:', error?.message || error);
  return res.json(fallbackData);
};

// 1. AI Explorer Chat Route
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, history = [], context = '' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Smart offline fallback
      return res.json({
        reply: `Here is a summary on "${message}": In modern software engineering, breaking this down into modular components and understanding underlying architectural trade-offs is essential. Check your notes and roadmap for practical implementations!`,
        suggestedActions: ['Add as note', 'Add to roadmap', 'Generate quiz'],
      });
    }

    const systemPrompt = `You are LearnFlow AI, an intelligent, encouraging, and highly technical mobile learning companion for developers and engineers. 
The user is Guru, a passionate software developer working on Java, Spring Boot, Vue.js, Distributed Systems, and Microservices.
Provide concise, mobile-friendly responses (use clear bullet points, brief code snippets where helpful, and high-signal advice). 
Keep responses under 250 words so they read beautifully on a mobile phone screen.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nContext:\n${context}\n\nUser Question: ${message}` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });

    const reply = response.text || "I couldn't process that query. Let's try another topic!";
    res.json({ reply });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.json({
      reply: `Regarding "${message}": Focus on core fundamentals first, build small isolated prototypes, and observe performance metrics under realistic loads. Let me know if you want a tailored quiz or roadmap milestone on this!`,
    });
  }
});

// 2. Dynamic Roadmap Generator Route
app.post('/api/ai/generate-roadmap', async (req: Request, res: Response) => {
  const { topic, timeframe = '8 weeks', currentLevel = 'Intermediate' } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        title: `${topic || 'Full Stack'} Mastery`,
        milestones: [
          { phase: 'Phase 1', title: 'Fundamentals & Setup', status: 'Completed', progress: 100, weeks: 'Weeks 1-2', tasks: ['Architecture basics', 'Environment setup', 'Hello World project'] },
          { phase: 'Phase 2', title: 'Deep Dive & Core Patterns', status: 'In Progress', progress: 55, weeks: 'Weeks 3-5', tasks: ['Data structures & API layer', 'Authentication & Security', 'State synchronization'] },
          { phase: 'Phase 3', title: 'Advanced Scalability', status: 'Upcoming', progress: 0, weeks: 'Weeks 6-7', tasks: ['Caching strategies', 'Message queues & events', 'Database tuning'] },
          { phase: 'Phase 4', title: 'Production & CI/CD', status: 'Upcoming', progress: 0, weeks: 'Week 8', tasks: ['Docker containerization', 'Observability & logging', 'Cloud deployment'] },
        ],
      });
    }

    const prompt = `Generate a structured learning roadmap for a developer learning: "${topic}". 
Timeframe: ${timeframe}, Current level: ${currentLevel}.
Return JSON only matching this format:
{
  "title": "Title of roadmap",
  "milestones": [
    {
      "phase": "Phase 1",
      "title": "Short title",
      "status": "Completed" | "In Progress" | "Upcoming",
      "progress": number (0-100),
      "weeks": "Weeks 1-2",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ]
}
Include exactly 4 sequential milestones. Do not wrap in markdown quotes if possible, or return valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Roadmap generation error:', err);
    res.json({
      title: `${topic || 'Specialized'} Roadmap`,
      milestones: [
        { phase: 'Phase 1', title: 'Core Foundations', status: 'Completed', progress: 100, weeks: 'Week 1-2', tasks: ['Syntax & Idioms', 'Tooling Setup', 'Basic Prototypes'] },
        { phase: 'Phase 2', title: 'Architecture & Patterns', status: 'In Progress', progress: 40, weeks: 'Week 3-4', tasks: ['Dependency Injection', 'Repository Pattern', 'Error Handling'] },
        { phase: 'Phase 3', title: 'System Integration', status: 'Upcoming', progress: 0, weeks: 'Week 5-6', tasks: ['REST & gRPC APIs', 'Database Indexing', 'Kafka Streaming'] },
        { phase: 'Phase 4', title: 'Cloud & Resiliency', status: 'Upcoming', progress: 0, weeks: 'Week 7-8', tasks: ['Docker & K8s', 'Chaos Testing', 'Production Monitoring'] },
      ],
    });
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

  server.listen(PORT, () => {
    console.log(`LearnFlow mobile server running at http://localhost:${PORT}`);
  });
}

startServer();
