import React, { useMemo } from 'react';
import { BarChart3, FileCode, Hash, Clock, HardDrive, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectFile } from '../../types';

interface ProjectStatsDashboardCardProps {
  files: ProjectFile[];
  activeFile: ProjectFile | null;
  lastModifiedTimestamp?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ProjectStatsDashboardCard: React.FC<ProjectStatsDashboardCardProps> = ({
  files,
  activeFile,
  lastModifiedTimestamp,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Compute project statistics
  const stats = useMemo(() => {
    let totalLines = 0;
    let totalBytes = 0;
    const langCounts: Record<string, number> = {};

    files.forEach((f) => {
      const lines = f.content.split('\n').length;
      totalLines += lines;
      totalBytes += new Blob([f.content]).size;

      const lang = f.language || 'other';
      langCounts[lang] = (langCounts[lang] || 0) + lines;
    });

    const formattedSize =
      totalBytes < 1024
        ? `${totalBytes} B`
        : totalBytes < 1024 * 1024
        ? `${(totalBytes / 1024).toFixed(1)} KB`
        : `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;

    // Calculate language percentages based on line counts
    const langBreakdown = Object.entries(langCounts)
      .map(([lang, lines]) => ({
        lang,
        percentage: totalLines > 0 ? Math.round((lines / totalLines) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      totalFiles: files.length,
      totalLines,
      formattedSize,
      langBreakdown,
    };
  }, [files]);

  const activeFileLines = activeFile ? activeFile.content.split('\n').length : 0;
  const displayTimestamp = lastModifiedTimestamp || 'Just now';

  return (
    <div className="mx-2 mb-2 rounded-xl bg-gradient-to-b from-[#131724] to-[#0c0f17] border border-slate-800/80 shadow-md overflow-hidden text-xs select-none">
      {/* Card Header */}
      <div
        onClick={onToggleCollapse}
        className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition border-b border-slate-800/60"
      >
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="tracking-tight text-[11px] uppercase">Project Dashboard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40 font-mono font-bold">
            {stats.totalFiles} files
          </span>
          {onToggleCollapse && (
            <button className="text-slate-400 hover:text-white p-0.5">
              {isCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      {!isCollapsed && (
        <div className="p-2.5 space-y-2.5 animate-in fade-in duration-150">
          {/* Key Metric Tiles Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Metric 1: Total Code Lines */}
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Hash className="w-3 h-3 text-indigo-400" />
                Est. Lines
              </span>
              <span className="text-sm font-bold font-mono text-slate-100 mt-1">
                {stats.totalLines.toLocaleString()}
              </span>
            </div>

            {/* Metric 2: Total Files Count */}
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <FileCode className="w-3 h-3 text-cyan-400" />
                Total Files
              </span>
              <span className="text-sm font-bold font-mono text-slate-100 mt-1">
                {stats.totalFiles}
              </span>
            </div>

            {/* Metric 3: Total Size */}
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-purple-400" />
                Project Size
              </span>
              <span className="text-xs font-bold font-mono text-slate-200 mt-1">
                {stats.formattedSize}
              </span>
            </div>

            {/* Metric 4: Last Modified Timestamp */}
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                Last Modified
              </span>
              <span className="text-[11px] font-bold font-mono text-emerald-400 mt-1 truncate" title={displayTimestamp}>
                {displayTimestamp}
              </span>
            </div>
          </div>

          {/* Active File Line Indicator */}
          {activeFile && (
            <div className="px-2 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Active: <span className="font-mono text-slate-200">{activeFile.name}</span>
              </span>
              <span className="font-mono text-slate-300 font-semibold shrink-0">
                {activeFileLines} lines
              </span>
            </div>
          )}

          {/* Language Composition Bar */}
          {stats.langBreakdown.length > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Code Breakdown</span>
                <span className="font-mono text-[9px] text-indigo-400">
                  {stats.langBreakdown[0]?.lang.toUpperCase()} {stats.langBreakdown[0]?.percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                {stats.langBreakdown.map((item, idx) => {
                  const colors = [
                    'bg-indigo-500',
                    'bg-cyan-500',
                    'bg-pink-500',
                    'bg-amber-500',
                    'bg-emerald-500',
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div
                      key={item.lang}
                      style={{ width: `${item.percentage}%` }}
                      title={`${item.lang}: ${item.percentage}%`}
                      className={`${color} h-full`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
