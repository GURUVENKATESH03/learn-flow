import React from 'react';
import { Home, BookOpen, FolderGit2, Compass, Bot } from 'lucide-react';

export type TabType = 'home' | 'notes' | 'projects' | 'roadmap' | 'ai';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Dashboard', icon: Home },
    { id: 'notes' as TabType, label: 'Notes', icon: BookOpen },
    { id: 'projects' as TabType, label: 'Projects', icon: FolderGit2 },
    { id: 'roadmap' as TabType, label: 'Roadmap', icon: Compass },
    { id: 'ai' as TabType, label: 'AI', icon: Bot },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 pt-2 pb-5 z-40">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.4] -translate-y-0.5' : 'stroke-[1.8]'
                  }`}
                />
                {tab.id === 'ai' && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
