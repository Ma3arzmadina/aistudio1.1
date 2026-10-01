import React from 'react';
import {
  Code2,
  Eye,
  Sparkles,
  Files,
  Terminal,
} from 'lucide-react';
import { MobileViewTab } from '../../types';

interface MobileNavBarProps {
  activeTab: MobileViewTab;
  onSelectTab: (tab: MobileViewTab) => void;
  consoleErrorCount?: number;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  onSelectTab,
  consoleErrorCount = 0,
}) => {
  const TABS: Array<{
    id: MobileViewTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    { id: 'editor', label: 'Code', icon: <Code2 className="w-4 h-4" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Chat', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { id: 'files', label: 'Files', icon: <Files className="w-4 h-4" /> },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <Terminal className="w-4 h-4" />,
      badge: consoleErrorCount > 0 ? consoleErrorCount : undefined,
    },
  ];

  return (
    <nav className="md:hidden h-14 bg-[#0a0c12] border-t border-slate-800/80 px-2 flex items-center justify-around select-none z-40 shrink-0">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition relative ${
              isActive
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge && (
                <span className="absolute -top-1 -right-2 bg-rose-600 text-white rounded-full text-[9px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            {isActive && (
              <div className="w-5 h-0.5 bg-indigo-500 rounded-full mt-0.5"></div>
            )}
          </button>
        );
      })}
    </nav>
  );
};
