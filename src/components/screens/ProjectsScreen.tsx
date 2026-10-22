import React, { useState, useEffect } from 'react';
import { Project, GitHubRepo, UserProfile, ProjectCommit, ProjectPullRequest } from '../../types';
import {
  FolderGit2,
  GitCommit,
  GitBranch,
  GitPullRequest,
  ExternalLink,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Lock,
  Globe,
  Star,
  GitFork,
  RefreshCw,
  Key,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Search,
  Trash2,
  Unlink,
  MessageSquare,
  Tag,
  ArrowUpRight,
  UserCheck,
  CheckSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProjectsScreenProps {
  projects: Project[];
  currentUser?: any;
  userProfile?: UserProfile | null;
  onToggleProjectTask: (projectId: string, taskId: string) => void;
  onAddProject: (newProj: Partial<Project>) => void;
  onDeleteProject?: (projectId: string) => void;
  onBatchAddProjects?: (newProjects: Project[]) => void;
  onUpdateProject?: (projectId: string, data: Partial<Project>) => void;
  onUpdateUserProfile?: (updates: Partial<UserProfile>) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  projects,
  currentUser,
  userProfile,
  onToggleProjectTask,
  onAddProject,
  onDeleteProject,
  onBatchAddProjects,
  onUpdateProject,
  onUpdateUserProfile,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'commits' | 'pull_requests'>('overview');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private' | 'github'>('all');

  // GitHub Auth & Sync States
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<'oauth' | 'pat' | 'username'>('oauth');
  const [oauthStatus, setOauthStatus] = useState<{ configured: boolean; clientId: string | null; callbackUrl: string } | null>(null);
  const [gitHubUsername, setGitHubUsername] = useState<string>(() => {
    return userProfile?.githubUsername || localStorage.getItem('learnflow_gh_username') || '';
  });
  const [gitHubToken, setGitHubToken] = useState<string>(() => {
    return userProfile?.githubAccessToken || localStorage.getItem('learnflow_gh_token') || '';
  });
  const [isGitHubConnected, setIsGitHubConnected] = useState<boolean>(() => {
    return Boolean(userProfile?.githubConnected || localStorage.getItem('learnflow_gh_connected') === 'true');
  });
  const [gitHubProfile, setGitHubProfile] = useState<{
    login: string;
    name: string;
    avatarUrl: string;
    publicRepos?: number;
    totalPrivateRepos?: number;
    bio?: string;
  } | null>(() => {
    const saved = localStorage.getItem('learnflow_gh_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return userProfile?.githubUsername
      ? {
          login: userProfile.githubUsername,
          name: userProfile.name,
          avatarUrl: userProfile.githubAvatarUrl || userProfile.avatarUrl,
        }
      : null;
  });

  // Modal State for Repo Explorer
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedRepos, setFetchedRepos] = useState<GitHubRepo[]>([]);
  const [repoSearch, setRepoSearch] = useState('');
  const [repoVisibilityScope, setRepoVisibilityScope] = useState<'all' | 'public' | 'private'>('all');
  const [syncingRepoId, setSyncingRepoId] = useState<number | null>(null);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Manual project creation modal
  const [showNewManualModal, setShowNewManualModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('Java, Spring Boot');
  const [newVisibility, setNewVisibility] = useState<'public' | 'private'>('public');

  // Single Project Sync state
  const [isRefreshingActiveProject, setIsRefreshingActiveProject] = useState(false);

  // Load GitHub server config status
  useEffect(() => {
    fetch('/api/github/status')
      .then((r) => r.json())
      .then((data) => setOauthStatus(data))
      .catch((e) => console.warn('GitHub status notice:', e));
  }, []);

  // Update selectedProjectId when projects list changes if needed
  useEffect(() => {
    if (projects.length > 0 && !projects.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Listen for OAuth Popup PostMessage
  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      // Allow messages from same origin or run.app
      if (!event.origin.includes('run.app') && !event.origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        const { token, user } = event.data;
        if (token) {
          setGitHubToken(token);
          localStorage.setItem('learnflow_gh_token', token);
        }
        if (user) {
          setGitHubUsername(user.login);
          setGitHubProfile({
            login: user.login,
            name: user.name || user.login,
            avatarUrl: user.avatar_url,
            publicRepos: user.public_repos,
            totalPrivateRepos: user.total_private_repos,
          });
          setIsGitHubConnected(true);
          localStorage.setItem('learnflow_gh_username', user.login);
          localStorage.setItem('learnflow_gh_connected', 'true');
          localStorage.setItem('learnflow_gh_profile', JSON.stringify({
            login: user.login,
            name: user.name || user.login,
            avatarUrl: user.avatar_url,
            publicRepos: user.public_repos,
            totalPrivateRepos: user.total_private_repos,
          }));

          // Update user profile in Firestore
          if (onUpdateUserProfile) {
            onUpdateUserProfile({
              githubUsername: user.login,
              githubAvatarUrl: user.avatar_url,
              githubConnected: true,
              githubAccessToken: token,
            });
          }

          confetti({ particleCount: 40, spread: 55 });
          // Auto fetch repositories
          fetchRepositories(user.login, token);
        }
      } else if (event.data?.type === 'GITHUB_OAUTH_ERROR') {
        setFetchError(`GitHub Authentication: ${event.data.error || 'Failed to complete OAuth authorization'}`);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [onUpdateUserProfile]);

  // Initiate OAuth Popup Flow
  const handleOpenOAuthPopup = async () => {
    setFetchError(null);
    try {
      const origin = window.location.origin;
      const res = await fetch(`/api/github/auth-url?origin=${encodeURIComponent(origin)}`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'GitHub OAuth credentials not configured. Please use a Personal Access Token or Username.');
      }

      const popup = window.open(
        data.url,
        'github_oauth_popup',
        'width=600,height=720,menubar=no,toolbar=no,status=no'
      );

      if (!popup) {
        alert('Please allow popups for this app to link your GitHub account.');
      }
    } catch (err: any) {
      setFetchError(err.message || 'Could not initiate GitHub OAuth popup');
    }
  };

  // Fetch repositories from API
  const fetchRepositories = async (usernameToFetch: string, tokenToUse?: string) => {
    if (!usernameToFetch && !tokenToUse) return;
    setIsFetchingRepos(true);
    setFetchError(null);

    try {
      const token = tokenToUse || gitHubToken;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const query = token ? '' : `?username=${encodeURIComponent(usernameToFetch)}`;
      const res = await fetch(`/api/github/repos${query}`, { headers });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch repositories for ${usernameToFetch}`);
      }

      const data: GitHubRepo[] = await res.json();
      setFetchedRepos(data);
      setIsGitHubConnected(true);
      setShowGitHubModal(true);

      // Save connection state locally
      localStorage.setItem('learnflow_gh_username', usernameToFetch);
      localStorage.setItem('learnflow_gh_connected', 'true');
    } catch (err: any) {
      console.warn('GitHub fetch error:', err);
      setFetchError(err.message || 'Could not fetch repositories. Verify username or token.');
    } finally {
      setIsFetchingRepos(false);
    }
  };

  // Submit GitHub Connect Form (for PAT or Username manual sync)
  const handleConnectManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitHubUsername.trim()) return;

    setIsFetchingRepos(true);
    setFetchError(null);

    try {
      // First verify user
      const token = gitHubToken.trim();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const query = token ? `?token=${encodeURIComponent(token)}` : `?username=${encodeURIComponent(gitHubUsername.trim())}`;
      const userRes = await fetch(`/api/github/user${query}`, { headers });

      if (!userRes.ok) {
        throw new Error(`GitHub user "${gitHubUsername}" not found or unauthorized token.`);
      }

      const userData = await userRes.json();
      setGitHubProfile(userData);
      setIsGitHubConnected(true);

      localStorage.setItem('learnflow_gh_username', userData.login);
      localStorage.setItem('learnflow_gh_connected', 'true');
      if (token) {
        localStorage.setItem('learnflow_gh_token', token);
      }
      localStorage.setItem('learnflow_gh_profile', JSON.stringify(userData));

      if (onUpdateUserProfile) {
        onUpdateUserProfile({
          githubUsername: userData.login,
          githubAvatarUrl: userData.avatarUrl,
          githubConnected: true,
          githubAccessToken: token || undefined,
        });
      }

      // Fetch repos
      await fetchRepositories(userData.login, token);
      confetti({ particleCount: 30, spread: 45 });
    } catch (err: any) {
      setFetchError(err.message || 'Failed to authenticate with GitHub.');
    } finally {
      setIsFetchingRepos(false);
    }
  };

  // Disconnect GitHub Account
  const handleDisconnectGitHub = () => {
    setIsGitHubConnected(false);
    setGitHubProfile(null);
    setGitHubUsername('');
    setGitHubToken('');
    setFetchedRepos([]);
    localStorage.removeItem('learnflow_gh_token');
    localStorage.removeItem('learnflow_gh_username');
    localStorage.removeItem('learnflow_gh_connected');
    localStorage.removeItem('learnflow_gh_profile');

    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        githubConnected: false,
        githubAccessToken: undefined,
        githubUsername: undefined,
        githubAvatarUrl: undefined,
      });
    }
  };

  // Import a single repository as a LearnFlow project (fetching real commits & PRs)
  const handleImportSingleRepo = async (repo: GitHubRepo) => {
    const exists = projects.some(
      (p) => p.title.toLowerCase() === repo.name.toLowerCase() || p.repoUrl === repo.htmlUrl || p.githubRepo === repo.name
    );

    if (exists) {
      alert(`Repository "${repo.name}" is already linked as a project.`);
      return;
    }

    setSyncingRepoId(repo.id);

    try {
      const res = await fetch('/api/github/sync-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          token: gitHubToken,
          username: gitHubUsername,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to synchronize repository details');
      }

      const newProject: Project = await res.json();
      onAddProject(newProject);
      setSelectedProjectId(newProject.id);
      confetti({ particleCount: 35, spread: 50 });
    } catch (err: any) {
      console.error('Error importing repo:', err);
      // Fallback: Add project with standard structure
      onAddProject({
        title: repo.name.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: repo.description || 'Imported from GitHub repository.',
        tags: [repo.language || 'Code', repo.private ? 'Private' : 'OpenSource'],
        progress: 25,
        repoUrl: repo.htmlUrl,
        iconBg: repo.private ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600',
        iconColor: repo.private ? 'purple' : 'emerald',
        visibility: repo.private ? 'private' : 'public',
        stars: repo.stars,
        forks: repo.forks,
        isGitHubSynced: true,
        githubOwner: repo.owner || gitHubUsername,
        githubRepo: repo.name,
        defaultBranch: repo.defaultBranch || 'main',
        lastSyncedAt: new Date().toISOString(),
        commits: [],
        pullRequests: [],
        tasks: [
          { id: `t-1`, text: 'Setup development dependencies and environment', done: true },
          { id: `t-2`, text: 'Explore codebase architecture and modules', done: false },
          { id: `t-3`, text: 'Implement scheduled enhancements', done: false },
        ],
        status: 'Active',
      });
    } finally {
      setSyncingRepoId(null);
    }
  };

  // Auto-Sync All Repositories as projects
  const handleAutoSyncAllRepos = async () => {
    if (fetchedRepos.length === 0) return;
    setIsBatchSyncing(true);

    const unsynced = fetchedRepos.filter(
      (r) => !projects.some((p) => p.title.toLowerCase() === r.name.toLowerCase() || p.repoUrl === r.htmlUrl)
    );

    if (unsynced.length === 0) {
      alert('All repositories are already synced as projects!');
      setIsBatchSyncing(false);
      return;
    }

    setBatchProgress({ current: 0, total: unsynced.length });
    const newlySyncedProjects: Project[] = [];

    for (let i = 0; i < unsynced.length; i++) {
      const repo = unsynced[i];
      setBatchProgress({ current: i + 1, total: unsynced.length });

      try {
        const res = await fetch('/api/github/sync-repo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo,
            token: gitHubToken,
            username: gitHubUsername,
          }),
        });

        if (res.ok) {
          const projectData: Project = await res.json();
          newlySyncedProjects.push(projectData);
        }
      } catch (err) {
        console.warn(`Sync failed for ${repo.name}`, err);
      }
    }

    if (newlySyncedProjects.length > 0) {
      if (onBatchAddProjects) {
        onBatchAddProjects(newlySyncedProjects);
      } else {
        newlySyncedProjects.forEach((p) => onAddProject(p));
      }
      setSelectedProjectId(newlySyncedProjects[0].id);
      confetti({ particleCount: 60, spread: 70 });
    }

    setIsBatchSyncing(false);
    setBatchProgress(null);
    setShowGitHubModal(false);
  };

  // Refresh active project commits & open PRs from GitHub
  const handleRefreshActiveProject = async () => {
    if (!activeProject || !activeProject.isGitHubSynced) return;
    setIsRefreshingActiveProject(true);

    const owner = activeProject.githubOwner || activeProject.repoUrl.split('/').slice(-2)[0] || gitHubUsername;
    const repoName = activeProject.githubRepo || activeProject.repoUrl.split('/').slice(-1)[0] || activeProject.title.toLowerCase().replace(/\s+/g, '-');

    try {
      const token = gitHubToken || undefined;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(
        `/api/github/repo-details?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}`,
        { headers }
      );

      if (!res.ok) {
        throw new Error('Could not refresh project commits & PRs');
      }

      const data = await res.json();
      const updatedData: Partial<Project> = {
        commits: data.commits || activeProject.commits,
        pullRequests: data.pullRequests || activeProject.pullRequests,
        stars: data.stars ?? activeProject.stars,
        forks: data.forks ?? activeProject.forks,
        defaultBranch: data.defaultBranch || activeProject.defaultBranch,
        lastSyncedAt: new Date().toISOString(),
      };

      if (onUpdateProject) {
        onUpdateProject(activeProject.id, updatedData);
      }

      confetti({ particleCount: 20, spread: 35 });
    } catch (err: any) {
      console.error('Refresh error:', err);
      alert(`Could not sync repository: ${err.message}`);
    } finally {
      setIsRefreshingActiveProject(false);
    }
  };

  // Create manual project
  const handleCreateManualProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddProject({
      title: newTitle.trim(),
      description: newDesc.trim() || 'A custom software project.',
      tags: newTags.split(',').map((t) => t.trim()),
      progress: 15,
      repoUrl: gitHubUsername ? `https://github.com/${gitHubUsername}/${newTitle.toLowerCase().replace(/\s+/g, '-')}` : '#',
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600',
      iconColor: 'indigo',
      visibility: newVisibility,
      status: 'Active',
      isGitHubSynced: false,
      commits: [
        {
          id: `c-init-${Date.now()}`,
          hash: 'a1b2c3d',
          message: 'chore: initial repository bootstrap',
          author: gitHubUsername || userProfile?.name || 'Guru',
          timeAgo: 'Just now',
          branch: 'main',
        },
      ],
      pullRequests: [],
      tasks: [
        { id: `t1-${Date.now()}`, text: 'Initialize repository structure', done: true },
        { id: `t2-${Date.now()}`, text: 'Implement initial feature endpoints', done: false },
        { id: `t3-${Date.now()}`, text: 'Write integration test coverage', done: false },
      ],
    });

    setNewTitle('');
    setNewDesc('');
    setShowNewManualModal(false);
    confetti({ particleCount: 30, spread: 40 });
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    if (visibilityFilter === 'all') return true;
    if (visibilityFilter === 'github') return p.isGitHubSynced;
    return p.visibility === visibilityFilter;
  });

  const activeProject =
    filteredProjects.find((p) => p.id === selectedProjectId) || filteredProjects[0] || projects[0];

  // Filtered fetched repos in modal
  const filteredFetchedRepos = fetchedRepos.filter((r) => {
    const matchesScope =
      repoVisibilityScope === 'all'
        ? true
        : repoVisibilityScope === 'public'
        ? !r.private
        : r.private;
    const matchesSearch =
      repoSearch.trim() === ''
        ? true
        : r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
          (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase())) ||
          (r.language && r.language.toLowerCase().includes(repoSearch.toLowerCase()));
    return matchesScope && matchesSearch;
  });

  return (
    <div className="space-y-4 px-5 pt-2 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Git Projects</h1>
          <p className="text-xs text-slate-500">Milestones, commit logs, open PRs & GitHub sync</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setShowGitHubModal(true);
              if (isGitHubConnected && gitHubUsername && fetchedRepos.length === 0) {
                fetchRepositories(gitHubUsername, gitHubToken);
              }
            }}
            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Sync GitHub Repositories"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sync Repos
          </button>
          <button
            onClick={() => setShowNewManualModal(true)}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm shadow-indigo-500/20"
            title="Create Custom Project"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GitHub Account Link Status Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between gap-3 shadow-xs border border-slate-700/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
            {gitHubProfile?.avatarUrl ? (
              <img src={gitHubProfile.avatarUrl} alt="GitHub avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold truncate">
                {isGitHubConnected && gitHubUsername ? `@${gitHubUsername}` : 'GitHub Account'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${isGitHubConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
              />
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              {isGitHubConnected
                ? `Linked • ${projects.filter((p) => p.isGitHubSynced).length} repos synced`
                : 'Link account to auto-sync repos, commits & PRs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isGitHubConnected ? (
            <>
              <button
                onClick={() => {
                  setShowGitHubModal(true);
                  if (gitHubUsername) fetchRepositories(gitHubUsername, gitHubToken);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Sync
              </button>
              <button
                onClick={handleDisconnectGitHub}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 transition"
                title="Disconnect GitHub"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowGitHubModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs font-bold text-white transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Link Account
            </button>
          )}
        </div>
      </div>

      {/* Visibility Scope Filter (All / GitHub Synced / Public / Private) */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 shadow-2xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setVisibilityFilter('all')}
          className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 ${
            visibilityFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          All ({projects.length})
        </button>
        <button
          onClick={() => setVisibilityFilter('github')}
          className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 ${
            visibilityFilter === 'github'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderGit2 className="w-3 h-3" />
          GitHub ({projects.filter((p) => p.isGitHubSynced).length})
        </button>
        <button
          onClick={() => setVisibilityFilter('public')}
          className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 ${
            visibilityFilter === 'public'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Globe className="w-3 h-3" />
          Public ({projects.filter((p) => p.visibility === 'public').length})
        </button>
        <button
          onClick={() => setVisibilityFilter('private')}
          className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 ${
            visibilityFilter === 'private'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Lock className="w-3 h-3" />
          Private ({projects.filter((p) => p.visibility === 'private').length})
        </button>
      </div>

      {/* Projects List or Zero-Data Fresh State */}
      {projects.length === 0 ? (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Projects Tracked Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-0.5">
              Link your GitHub account to automatically sync your repositories with commits and open PRs, or track custom projects.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setShowGitHubModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Link GitHub
            </button>
            <button
              onClick={() => setShowNewManualModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-semibold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Project Selector Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredProjects.map((proj) => {
              const isSelected = proj.id === activeProject?.id;
              const prsCount = proj.pullRequests?.length ?? 0;
              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                        proj.visibility === 'private'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {proj.visibility === 'private' ? (
                        <>
                          <Lock className="w-2.5 h-2.5" /> Private
                        </>
                      ) : (
                        <>
                          <Globe className="w-2.5 h-2.5" /> Public
                        </>
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      {prsCount > 0 && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                          <GitPullRequest className="w-2.5 h-2.5" /> {prsCount}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {proj.progress}%
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {proj.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {proj.tags.join(', ')}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Project Card & Details */}
          {activeProject && (
            <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
              {/* Project Title, GitHub Stats & Actions */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          activeProject.visibility === 'private'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {activeProject.visibility === 'private' ? (
                          <>
                            <Lock className="w-3 h-3" /> Private Repo
                          </>
                        ) : (
                          <>
                            <Globe className="w-3 h-3" /> Public Repo
                          </>
                        )}
                      </span>
                      {activeProject.isGitHubSynced && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-emerald-400" /> Synced with GitHub
                        </span>
                      )}
                      {activeProject.stars !== undefined && activeProject.stars > 0 && (
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {activeProject.stars}
                        </span>
                      )}
                      {activeProject.forks !== undefined && activeProject.forks > 0 && (
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5">
                          <GitFork className="w-3 h-3 text-slate-400" /> {activeProject.forks}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {activeProject.title}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                      {activeProject.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {activeProject.isGitHubSynced && (
                      <button
                        onClick={handleRefreshActiveProject}
                        disabled={isRefreshingActiveProject}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
                        title="Re-sync commits & PRs from GitHub"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshingActiveProject ? 'animate-spin text-indigo-600' : ''}`} />
                      </button>
                    )}
                    <a
                      href={activeProject.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
                      title="View GitHub Repository"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {onDeleteProject && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${activeProject.title}" from LearnFlow projects?`)) {
                            onDeleteProject(activeProject.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-rose-500 transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tags & Default Branch */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {activeProject.defaultBranch && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 flex items-center gap-1">
                      <GitBranch className="w-2.5 h-2.5" />
                      {activeProject.defaultBranch}
                    </span>
                  )}
                  {activeProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {activeProject.lastSyncedAt && (
                    <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      Synced {new Date(activeProject.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Milestone Completion</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{activeProject.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${activeProject.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sub-tab switcher: Tasks vs Git Commits vs Open PRs */}
              <div className="flex border-b border-slate-100 dark:border-slate-700 pt-1">
                <button
                  onClick={() => setActiveSubTab('overview')}
                  className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
                    activeSubTab === 'overview'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Tasks ({activeProject.tasks.filter((t) => t.done).length}/{activeProject.tasks.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('commits')}
                  className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                    activeSubTab === 'commits'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  Commits ({activeProject.commits?.length || 0})
                </button>
                <button
                  onClick={() => setActiveSubTab('pull_requests')}
                  className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                    activeSubTab === 'pull_requests'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  Open PRs ({activeProject.pullRequests?.length || 0})
                </button>
              </div>

              {/* Tab 1: Tasks List */}
              {activeSubTab === 'overview' && (
                <div className="space-y-2">
                  {activeProject.tasks.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No tasks recorded for this project.</p>
                  ) : (
                    activeProject.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onToggleProjectTask(activeProject.id, task.id)}
                        className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 flex items-center gap-2.5 text-left transition"
                      >
                        {task.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <span
                          className={`text-xs ${
                            task.done
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-700 dark:text-slate-200 font-medium'
                          }`}
                        >
                          {task.text}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Git Commits */}
              {activeSubTab === 'commits' && (
                <div className="space-y-2">
                  {(!activeProject.commits || activeProject.commits.length === 0) ? (
                    <div className="p-5 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-1.5">
                      <GitCommit className="w-6 h-6 mx-auto text-slate-400" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No commits fetched yet</p>
                      <button
                        onClick={handleRefreshActiveProject}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        Click to fetch latest commits from GitHub
                      </button>
                    </div>
                  ) : (
                    activeProject.commits.map((commit) => (
                      <div
                        key={commit.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1 font-mono text-xs hover:border-slate-300 transition"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                          <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                            <GitBranch className="w-3 h-3" />
                            {commit.branch || 'main'}
                          </span>
                          <span>{commit.timeAgo}</span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium font-sans break-words">
                          {commit.message}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            {commit.authorAvatar ? (
                              <img src={commit.authorAvatar} alt={commit.author} className="w-3.5 h-3.5 rounded-full object-cover" />
                            ) : null}
                            <span>by {commit.author}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {commit.hash}
                            </span>
                            {commit.url && (
                              <a
                                href={commit.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-indigo-600"
                                title="View commit on GitHub"
                              >
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Open Pull Requests */}
              {activeSubTab === 'pull_requests' && (
                <div className="space-y-2">
                  {(!activeProject.pullRequests || activeProject.pullRequests.length === 0) ? (
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="w-9 h-9 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        No Open Pull Requests
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        All branches are up to date and merged into {activeProject.defaultBranch || 'main'}.
                      </p>
                    </div>
                  ) : (
                    activeProject.pullRequests.map((pr) => (
                      <div
                        key={pr.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2 hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shrink-0">
                              <GitPullRequest className="w-3 h-3" />
                              #{pr.number}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {pr.title}
                            </h5>
                          </div>
                          <a
                            href={pr.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition shrink-0"
                            title="Open PR on GitHub"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Labels & Branch */}
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                          {pr.headBranch && pr.baseBranch && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9px] flex items-center gap-1">
                              <span>{pr.headBranch}</span>
                              <span>→</span>
                              <span>{pr.baseBranch}</span>
                            </span>
                          )}
                          {pr.labels?.map((label) => (
                            <span
                              key={label}
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300"
                            >
                              {label}
                            </span>
                          ))}
                        </div>

                        {/* Author & Timestamp */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-800 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            {pr.authorAvatar && (
                              <img src={pr.authorAvatar} alt={pr.author} className="w-3.5 h-3.5 rounded-full object-cover" />
                            )}
                            <span className="font-medium text-slate-600 dark:text-slate-300">@{pr.author}</span>
                            <span>•</span>
                            <span>{pr.timeAgo}</span>
                          </div>
                          {pr.commentsCount !== undefined && pr.commentsCount > 0 && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <MessageSquare className="w-3 h-3" />
                              {pr.commentsCount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* GitHub Account Link & Repository Sync Modal */}
      {showGitHubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    GitHub Integration & Sync
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isGitHubConnected ? `Connected as @${gitHubUsername}` : 'Connect account to track repositories'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGitHubModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message if any */}
            {fetchError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{fetchError}</span>
              </div>
            )}

            {/* Tab selector for Connection Method */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMethod('oauth')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  authMethod === 'oauth'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                OAuth Popup
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('pat')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  authMethod === 'pat'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Access Token (PAT)
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('username')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  authMethod === 'username'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Username
              </button>
            </div>

            {/* Method 1: OAuth Flow */}
            {authMethod === 'oauth' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> One-Click GitHub Authorization
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Authorizes LearnFlow via GitHub OAuth popup to securely list your public and private repositories, commits, and pull requests.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenOAuthPopup}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Authorize with GitHub Popup
                </button>

                <div className="text-[10px] text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Callback URL:</span>{' '}
                  <code className="text-indigo-600 dark:text-indigo-400 font-mono select-all">
                    {oauthStatus?.callbackUrl || `${window.location.origin}/auth/callback`}
                  </code>
                </div>
              </div>
            )}

            {/* Method 2 & 3: Form for PAT or Username */}
            {(authMethod === 'pat' || authMethod === 'username') && (
              <form onSubmit={handleConnectManual} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    required
                    value={gitHubUsername}
                    onChange={(e) => setGitHubUsername(e.target.value)}
                    placeholder="e.g. torvalds or your-github-handle"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {authMethod === 'pat' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Personal Access Token
                      </label>
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5"
                      >
                        Generate token <ArrowUpRight className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={gitHubToken}
                        onChange={(e) => setGitHubToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxx (repo, read:user)"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isFetchingRepos}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isFetchingRepos ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Connect & Fetch Repositories
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Repositories Explorer & Auto-Sync Bar */}
            {fetchedRepos.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-indigo-600" />
                    Available Repositories ({fetchedRepos.length})
                  </span>
                  <button
                    onClick={handleAutoSyncAllRepos}
                    disabled={isBatchSyncing}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs disabled:opacity-50"
                  >
                    {isBatchSyncing ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Syncing ({batchProgress?.current}/{batchProgress?.total})
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" /> Auto-Sync All
                      </>
                    )}
                  </button>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      placeholder="Search repos by name, language..."
                      className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRepoVisibilityScope('all')}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold ${
                        repoVisibilityScope === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepoVisibilityScope('public')}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold ${
                        repoVisibilityScope === 'public'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepoVisibilityScope('private')}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold ${
                        repoVisibilityScope === 'private'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Private
                    </button>
                  </div>
                </div>

                {/* Repos list */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredFetchedRepos.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No matching repositories found.</p>
                  ) : (
                    filteredFetchedRepos.map((repo) => {
                      const isAlreadyTracked = projects.some(
                        (p) =>
                          p.title.toLowerCase() === repo.name.toLowerCase() ||
                          p.repoUrl === repo.htmlUrl ||
                          p.githubRepo === repo.name
                      );
                      const isCurrentlySyncing = syncingRepoId === repo.id;

                      return (
                        <div
                          key={repo.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {repo.name}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 ${
                                repo.private
                                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {repo.private ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                              {repo.private ? 'Private' : 'Public'}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {repo.description || 'No description provided.'}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">{repo.language}</span>
                              <span className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 text-amber-500" /> {repo.stars}
                              </span>
                              {repo.openIssuesCount !== undefined && repo.openIssuesCount > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <AlertCircle className="w-3 h-3 text-slate-400" /> {repo.openIssuesCount}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleImportSingleRepo(repo)}
                              disabled={isAlreadyTracked || isCurrentlySyncing}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 ${
                                isAlreadyTracked
                                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-default'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                              }`}
                            >
                              {isCurrentlySyncing ? (
                                <>
                                  <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Syncing...
                                </>
                              ) : isAlreadyTracked ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" /> Synced
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" /> Sync as Project
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual New Project Modal */}
      {showNewManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Track Custom Project</h3>
            <form onSubmit={handleCreateManualProject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cache Node"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of the architecture"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Visibility
                </label>
                <select
                  value={newVisibility}
                  onChange={(e) => setNewVisibility(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="public">Public Repository</option>
                  <option value="private">Private Repository</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Java, Concurrency, Redis"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewManualModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
