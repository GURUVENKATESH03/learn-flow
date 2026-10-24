# LearnFlow 🚀

> **AI-Powered Smart Learning & Project Management Platform**  
> Accelerated learning roadmaps, interactive knowledge graphs, GitHub repository activity tracking, smart note-taking, and AI mentoring powered by Google Gemini.

---

## 📖 Overview

**LearnFlow** is a modern, unified learning and developer companion app built with React, TypeScript, Vite, Tailwind CSS, Express, and Firebase. It bridges the gap between studying theory and building real-world projects by connecting your notes, personalized learning roadmaps, project tracking, and GitHub activity under an interactive AI-assisted workflow.

It also comes packaged with a cross-platform mobile app setup using **Expo / React Native**.

---

## ✨ Key Features

- 🧠 **AI-Powered Learning Roadmaps**: Generate customized milestone-driven curricula and step-by-step tasks using Gemini AI (with intelligent domain fallbacks).
- 💬 **AI Study Companion / Tutor**: Interactive AI chat assistant for explanations, debugging help, and personalized study advice.
- 📝 **Smart Notes & Knowledge Graph**:
  - Tagged markdown notes.
  - Automatic note tagging and AI note exploration.
  - Interactive knowledge graph visualization to see how concepts connect.
- 🐙 **GitHub Integration & Project Tracking**:
  - OAuth login and GitHub Personal Access Token support.
  - Sync repositories, track commits, branches, issues, and language stats.
  - Link projects directly to learning milestones.
- 🎯 **Interactive Quizzes & Lessons**: AI-generated assessment quizzes and structured lesson walkthroughs.
- 📊 **Activity & Analytics**: Visual charts tracking daily study streaks, learning hours, and milestones.
- 📱 **Expo / React Native Companion**: Dedicated mobile client in the `expo/` directory with Firebase auth/firestore sync.

---

## 🛠️ Tech Stack

### Web & Backend
- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons, Canvas Confetti
- **Backend / API**: Express 4, TSX (Node.js runtime)
- **AI**: `@google/genai` (Google Gemini API)
- **Database / Auth**: Firebase (Authentication & Cloud Firestore)

### Mobile (`expo/`)
- **Framework**: Expo (React Native)
- **Icons & Styling**: Expo Vector Icons, React Native StyleSheet
- **Backend**: Firebase JS SDK

---

## 📂 Project Structure

```text
learnflow/
├── expo/                          # React Native / Expo mobile app
│   ├── App.tsx                    # Mobile root component
│   ├── app.json                   # Expo configuration
│   └── firebaseConfig.ts          # Mobile Firebase configuration
├── public/                        # Static assets
├── src/
│   ├── components/
│   │   ├── charts/                # Interactive Knowledge Graph & Activity Charts
│   │   ├── common/                # Shared UI (Markdown renderer, Toast, etc.)
│   │   ├── modals/                # Modals (Quiz, Lesson, Notes, Export)
│   │   └── screens/               # Core screens (Home, Roadmap, AI, Notes, Projects, Login)
│   ├── lib/
│   │   └── firebase.ts            # Web Firebase initialization & helpers
│   ├── types/
│   │   └── index.ts               # Core TypeScript interfaces
│   ├── App.tsx                    # Web application layout & state
│   ├── main.tsx                   # Frontend entry point
│   └── index.css                  # Tailwind styles
├── server.ts                      # Express API server & Gemini integration
├── firestore.rules                # Firebase Firestore security rules
├── package.json                   # Web & backend dependencies
└── vite.config.ts                 # Vite bundler configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm**, **bun**, or **yarn**
- **Google Gemini API Key** ([Get one at Google AI Studio](https://aistudio.google.com/))
- *(Optional)* **GitHub Personal Access Token** or GitHub OAuth App for repository sync.
- *(Optional)* **Firebase Project** for cloud persistence.

---

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/GURUVENKATESH03/learn-flow.git
cd learn-flow
npm install
```

---

### 3. Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Populate the `.env` variables:

```env
# Required for Gemini AI features
GEMINI_API_KEY="your-gemini-api-key"

# App URL (default local development)
APP_URL="http://localhost:3000"

# Optional: GitHub personal access token for repo sync
GITHUB_TOKEN="your-github-token"

# Optional: GitHub OAuth App credentials (if using OAuth flow)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

---

### 4. Running the Web Application

Start the Express API and Vite frontend concurrently via TSX:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

### 5. Running the Mobile App (Expo)

Navigate to the `expo` directory:

```bash
cd expo
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS/Android) or run on an emulator (`a` for Android, `i` for iOS).

---

## 🔌 API Endpoints (`server.ts`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ai/status` | Check Gemini API connection status |
| `POST` | `/api/ai/chat` | AI conversation endpoint |
| `POST` | `/api/ai/generate-roadmap` | Generate learning milestones and tasks |
| `POST` | `/api/ai/generate-quiz` | Generate assessment quiz for a topic |
| `POST` | `/api/ai/explore-note` | Expand note contents with deeper context |
| `POST` | `/api/ai/auto-tag` | Automatically generate tags for a note |
| `GET` | `/api/github/status` | Check GitHub token / authentication status |
| `GET` | `/api/github/auth-url` | Generate GitHub OAuth login URL |
| `GET` | `/api/github/user` | Fetch authenticated GitHub user profile |
| `GET` | `/api/github/repos` | List repositories for the user |
| `GET` | `/api/github/repo-details` | Fetch repository details, commits, and branches |
| `POST` | `/api/github/sync-repo` | Sync repository data to projects |

---

## 📜 Available Scripts

- `npm run dev`: Runs the full-stack development server with TSX (`server.ts`).
- `npm run build`: Builds the Vite production bundle to `dist/`.
- `npm run start`: Runs `server.ts` with Node.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs TypeScript type checking without emitting files.

---

## 📄 License

This project is open-source. Check repository details for license specifics.
