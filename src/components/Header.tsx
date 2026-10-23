import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  BookOpen,
  Bell,
  Flame,
  CheckCircle2,
  Award,
  Sparkles,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  Smartphone,
  Check,
  Palette,
  Database,
  Trash2,
  Camera,
  UploadCloud,
  RefreshCw,
  Edit3,
  Image as ImageIcon,
} from 'lucide-react';
import { TabType } from './Navigation';
import { ExpoExportModal } from './modals/ExpoExportModal';

interface HeaderProps {
  user: UserProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout?: () => void;
  onResetData?: () => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  activeTab?: TabType;
  onChangeTab?: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  theme,
  onToggleTheme,
  onLogout,
  onResetData,
  onUpdateAvatar,
  activeTab,
  onChangeTab,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExpoModal, setShowExpoModal] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<string | null>('profile');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  const PRESET_AVATARS = [
    { label: 'Developer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'Architect', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { label: 'Full Stack', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { label: 'Bot Coder', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=LearnFlow' },
    { label: 'Pixel Dev', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Prakash' },
    { label: 'Adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Developer' },
    { label: 'Lorelei', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Guru' },
  ];

  const handleSelectAvatar = (url: string) => {
    onUpdateAvatar?.(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Please select an image under 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateAvatar?.(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomAvatar = () => {
    const seeds = ['Zenith', 'Matrix', 'Nexus', 'Quantum', 'Byte', 'Vortex', 'Apex', 'Falcon', 'DevFlow', 'Prakash'];
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)] + '-' + Date.now();
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
    onUpdateAvatar?.(newAvatar);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  const notifications = [
    {
      id: '1',
      title: 'Daily Streak Milestone! 🔥',
      desc: 'You reached a 12-day learning streak. Keep up the momentum!',
      time: '15m ago',
      read: false,
    },
    {
      id: '2',
      title: 'Google & Gemini Connected ⚡',
      desc: 'Your Gemini AI session is active with your Google profile.',
      time: '1h ago',
      read: true,
    },
    {
      id: '3',
      title: 'Roadmap Progress',
      desc: 'Spring Boot Security milestone is 60% complete.',
      time: '2h ago',
      read: true,
    },
  ];

  return (
    <>
      <header className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          {/* Brand logo & name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Learn<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </span>
              <span className="hidden lg:inline text-[10px] text-slate-400 dark:text-slate-500 ml-2 font-mono">
                web & mobile
              </span>
            </div>
          </div>

          {/* Desktop Primary Navigation Tabs */}
          {onChangeTab && activeTab && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => onChangeTab('home')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'home'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => onChangeTab('notes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Notes & Mind Map</span>
              </button>
              <button
                onClick={() => onChangeTab('projects')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'projects'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Projects & GitHub</span>
              </button>
              <button
                onClick={() => onChangeTab('roadmap')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'roadmap'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>AI Roadmap</span>
              </button>
              <button
                onClick={() => onChangeTab('ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'ai'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Companion</span>
              </button>
            </nav>
          )}

          {/* Right actions: Theme Switcher, Notifications & Avatar */}
          <div className="flex items-center gap-2">
            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Notification bell */}
            <button
              onClick={() => {
                setShowNotifications(true);
                setHasUnread(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full" />
              )}
            </button>

            {/* User Avatar */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="relative rounded-full ring-2 ring-indigo-500/30 hover:ring-indigo-500 transition overflow-hidden cursor-pointer"
              aria-label="User profile"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-start sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-12 sm:mt-0">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal with Collapsible Accordion Sections */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
            {/* Persistent Top Header with Close Button */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile & Preferences</h3>
                  <p className="text-xs text-slate-500">Manage account, theme, and data sync</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Accordion Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {/* Accordion 1: User Profile & Learning Stats */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
                <button
                  type="button"
                  onClick={() => toggleAccordion('profile')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Learner Profile & Stats</span>
                      <span className="text-[10px] text-slate-400">Account info and streak progress</span>
                    </div>
                  </div>
                  {openAccordion === 'profile' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openAccordion === 'profile' && (
                  <div className="p-4 pt-1 space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative group">
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500 shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition cursor-pointer"
                              title="Change avatar"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h4>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{user.role}</p>
                            <p className="text-[11px] text-slate-400">{user.email}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                          className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{isEditingAvatar ? 'Done' : 'Change Avatar'}</span>
                        </button>
                      </div>

                      {/* Expandable Avatar Customizer */}
                      {isEditingAvatar && (
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-indigo-100 dark:border-indigo-900/60 shadow-xs space-y-3 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-indigo-500" />
                              Choose Profile Avatar
                            </span>
                            <button
                              type="button"
                              onClick={handleRandomAvatar}
                              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" /> Randomize
                            </button>
                          </div>

                          {/* Presets Grid */}
                          <div className="grid grid-cols-4 gap-2">
                            {PRESET_AVATARS.map((preset, idx) => {
                              const isSelected = user.avatarUrl === preset.url;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSelectAvatar(preset.url)}
                                  className={`relative rounded-xl p-1 border transition flex flex-col items-center cursor-pointer ${
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 ring-2 ring-indigo-400'
                                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                  }`}
                                >
                                  <img
                                    src={preset.url}
                                    alt={preset.label}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate w-full text-center mt-1">
                                    {preset.label}
                                  </span>
                                  {isSelected && (
                                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                      <Check className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Actions: Upload Image File or Custom URL */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                            <label className="flex-1 py-2 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-indigo-100 transition">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Upload Photo File</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>

                            <div className="flex-1 flex gap-1">
                              <input
                                type="url"
                                placeholder="Paste image URL..."
                                value={customAvatarUrl}
                                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <button
                                type="button"
                                disabled={!customAvatarUrl.trim()}
                                onClick={() => {
                                  if (customAvatarUrl.trim()) {
                                    handleSelectAvatar(customAvatarUrl.trim());
                                    setCustomAvatarUrl('');
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-40 hover:bg-indigo-700 transition"
                              >
                                Set
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-center">
                        <span className="text-[11px] text-slate-500">Learning Streak</span>
                        <p className="text-base font-extrabold text-amber-500 flex items-center justify-center gap-1 mt-0.5">
                          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                          {user.streak} Days
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-center">
                        <span className="text-[11px] text-slate-500">Weekly Goals</span>
                        <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {user.weeklyGoals.completed}/{user.weeklyGoals.total} Done
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-400">Total Notes</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{user.totalNotes}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-400">Projects Tracked</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{user.totalProjects}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Default AI Model</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Gemini 3.8 Flash</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Appearance & Theme */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
                <button
                  type="button"
                  onClick={() => toggleAccordion('theme')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Appearance & Theme</span>
                      <span className="text-[10px] text-slate-400">Current: {theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
                    </div>
                  </div>
                  {openAccordion === 'theme' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openAccordion === 'theme' && (
                  <div className="p-3.5 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 pt-3">
                      Choose your preferred color theme. Dark mode reduces eye strain in low-light environments.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          if (theme !== 'light') onToggleTheme();
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                          theme === 'light'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Sun className="w-4 h-4 text-amber-500" /> Light Mode
                      </button>
                      <button
                        onClick={() => {
                          if (theme !== 'dark') onToggleTheme();
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Cloud Sync & Export */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
                <button
                  type="button"
                  onClick={() => toggleAccordion('sync')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Sync & Data Backups</span>
                      <span className="text-[10px] text-slate-400">Firebase Firestore and offline exports</span>
                    </div>
                  </div>
                  {openAccordion === 'sync' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openAccordion === 'sync' && (
                  <div className="p-3.5 pt-0 space-y-2.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Firebase Cloud Firestore & Auth
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Live Sync
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const exportData = {
                          user,
                          exportedAt: new Date().toISOString(),
                          database: 'Google Cloud Firestore',
                          app: 'LearnFlow Web App',
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `learnflow-backup-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Export JSON Database Backup</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        setShowExpoModal(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Export / View Expo Mobile App</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion 4: Account Actions & Data Reset */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
                <button
                  type="button"
                  onClick={() => toggleAccordion('danger')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Account Actions</span>
                      <span className="text-[10px] text-slate-400">Database reset and sign out</span>
                    </div>
                  </div>
                  {openAccordion === 'danger' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openAccordion === 'danger' && (
                  <div className="p-3.5 pt-0 space-y-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 pt-3">
                      Resetting the database will remove all notes and projects to start 100% clean.
                    </p>
                    {onResetData && (
                      <button
                        onClick={() => {
                          setShowProfileModal(false);
                          onResetData();
                        }}
                        className="w-full py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset Database (0 Notes, 0 Projects)</span>
                      </button>
                    )}

                    {onLogout && (
                      <button
                        onClick={() => {
                          setShowProfileModal(false);
                          onLogout();
                        }}
                        className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out / Switch Account</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50 dark:bg-slate-900/60">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpoModal && (
        <ExpoExportModal onClose={() => setShowExpoModal(false)} />
      )}
    </>
  );
};
