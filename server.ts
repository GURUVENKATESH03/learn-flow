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
