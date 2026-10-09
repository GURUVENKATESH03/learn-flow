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
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
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
  timeAgo: string;
  branch: string;
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
  commits: ProjectCommit[];
  tasks: { id: string; text: string; done: boolean }[];
  status: 'Active' | 'Completed' | 'In Review';
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
