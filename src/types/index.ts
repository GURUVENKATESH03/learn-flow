export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
  email: string;
  streak: number;
  totalNotes: number;
  totalProjects: number;
  weeklyGoals: {
    completed: number;
    total: number;
  };
  googleId?: string;
  isGoogleConnected?: boolean;
  githubUsername?: string;
  githubAvatarUrl?: string;
  githubConnected?: boolean;
  githubAccessToken?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
  color: 'teal' | 'amber' | 'emerald' | 'blue' | 'indigo' | 'rose';
  relatedNoteIds?: string[];
  mindMapNodes?: { id: string; label: string; type: 'root' | 'concept' | 'practice' }[];
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  dueDate?: string;
}

export interface ProjectCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  authorAvatar?: string;
  timeAgo: string;
  branch: string;
  url?: string;
}

export interface ProjectPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: string;
  authorAvatar?: string;
  createdAt: string;
  timeAgo: string;
  htmlUrl: string;
  commentsCount?: number;
  draft?: boolean;
  labels?: string[];
  headBranch?: string;
  baseBranch?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  tags: string[];
  repoUrl: string;
  iconBg: string;
  iconColor: string;
  visibility: 'public' | 'private';
  stars?: number;
  forks?: number;
  isGitHubSynced?: boolean;
  githubOwner?: string;
  githubRepo?: string;
  defaultBranch?: string;
  lastSyncedAt?: string;
  commits: ProjectCommit[];
  pullRequests?: ProjectPullRequest[];
  tasks: { id: string; text: string; done: boolean }[];
  status: 'Active' | 'Completed' | 'In Review';
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  htmlUrl: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  defaultBranch?: string;
  openIssuesCount?: number;
  owner?: string;
}

export interface RoadmapMilestone {
  phase: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  progress: number;
  weeks: string;
  tasks: string[];
}

export interface Roadmap {
  id: string;
  title: string;
  roleTrack: string;
  currentWeek: number;
  totalWeeks: number;
  overallProgress: number;
  updatedAt?: number;
  milestones: RoadmapMilestone[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  topic: string;
  questions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}
