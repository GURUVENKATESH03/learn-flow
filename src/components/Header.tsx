import React, { useState } from 'react';
import { UserProfile } from '../types';
import { BookOpen, Bell, Flame, CheckCircle2, Award, Sparkles, X, ChevronRight, User } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

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
      title: 'Roadmap Progress',
      desc: 'Spring Boot Security milestone is 60% complete.',
      time: '2h ago',
      read: true,
    },
    {
      id: '3',
      title: 'AI Insight Available',
      desc: 'Generated 3 new flashcards from your Kafka Basics notes.',
      time: '1d ago',
      read: true,
    },
  ];

  return (
    <>
      <header className="px-5 pt-3 pb-3 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800">
        {/* Brand logo & name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xs">
            <BookOpen className="w-4 h-4 stroke-[2.4]" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Learn<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
          </span>
        </div>

        {/* Right actions: Notifications & Avatar */}
        <div className="flex items-center gap-2.5">
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
            className="relative rounded-full ring-2 ring-indigo-500/30 hover:ring-indigo-500 transition overflow-hidden"
            aria-label="User profile"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>
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

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Guru Venkatesh</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500">Learning Streak</span>
                <p className="text-lg font-extrabold text-amber-500 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {user.streak} Days
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500">Weekly Goals</span>
                <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {user.weeklyGoals.completed}/{user.weeklyGoals.total} Done
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Total Notes</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.totalNotes}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Projects Tracked</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.totalProjects}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Primary Track</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Java Backend Developer</span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
