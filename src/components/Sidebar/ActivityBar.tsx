import React from 'react';
import { Files, Search, Sparkles, Terminal, Settings, Layers } from 'lucide-react';

export type SidebarTab = 'explorer' | 'search' | 'templates';

interface ActivityBarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onOpenSettings: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  onOpenSettings,
}) => {
  const handleTabClick = (tab: SidebarTab) => {
    if (activeTab === tab && isSidebarOpen) {
      setIsSidebarOpen(false);
    } else {
      setActiveTab(tab);
      setIsSidebarOpen(true);
    }
  };

  return (
    <aside className="w-12 bg-[#0a0c12] border-r border-slate-800/80 flex flex-col items-center justify-between py-3 select-none z-20">
      {/* Top icons */}
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          onClick={() => handleTabClick('explorer')}
          title="Explorer (Files & Folders)"
          className={`relative p-2 rounded-lg transition group ${
            activeTab === 'explorer' && isSidebarOpen
              ? 'text-indigo-400 bg-slate-800/70'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          {activeTab === 'explorer' && isSidebarOpen && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-500 rounded-r"></div>
          )}
          <Files className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleTabClick('search')}
          title="Search in Files"
          className={`relative p-2 rounded-lg transition group ${
            activeTab === 'search' && isSidebarOpen
              ? 'text-indigo-400 bg-slate-800/70'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          {activeTab === 'search' && isSidebarOpen && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-500 rounded-r"></div>
          )}
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleTabClick('templates')}
          title="Starter Project Templates"
          className={`relative p-2 rounded-lg transition group ${
            activeTab === 'templates' && isSidebarOpen
              ? 'text-indigo-400 bg-slate-800/70'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          {activeTab === 'templates' && isSidebarOpen && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-500 rounded-r"></div>
          )}
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom icons */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onOpenSettings}
          title="Settings & Workspace Preferences"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg transition cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
