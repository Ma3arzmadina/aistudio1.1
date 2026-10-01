import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Trash2,
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Maximize2,
  Minimize2,
  X,
  CornerDownLeft,
} from 'lucide-react';
import { ConsoleLog, ProjectFile } from '../../types';

interface TerminalPanelProps {
  logs: ConsoleLog[];
  onClearLogs: () => void;
  files: ProjectFile[];
  onExportZip: () => void;
  onClose: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  logs,
  onClearLogs,
  files,
  onExportZip,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'console'>('terminal');
  const [logFilter, setLogFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<
    Array<{ type: 'cmd' | 'output' | 'error' | 'system'; text: string; time: string }>
  >([
    {
      type: 'system',
      text: 'OmniCode Terminal v2.4.0 (x86_64-web-sandbox)\nType "help" to list available commands or type any JavaScript expression.',
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = commandInput.trim();
    if (!rawCmd) return;

    const time = new Date().toLocaleTimeString();
    const newEntries = [...history, { type: 'cmd' as const, text: `$ ${rawCmd}`, time }];

    const parts = rawCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    switch (cmd) {
      case 'clear':
      case 'cls':
        setHistory([]);
        setCommandInput('');
        return;

      case 'help':
        newEntries.push({
          type: 'output',
          text: `OmniCode Studio Shell Commands:
  ls, dir           List all files in workspace
  cat <file>        View content of a file
  run <file>        Execute a JS or HTML file in virtual sandbox
  python <file>     Simulate Python 3.12 script execution
  node <file>       Run JS script with Node runtime emulation
  export, zip       Download workspace as a clean .zip folder
  git status        Check workspace status
  clear             Clear terminal screen
  <js-expression>   Evaluate JavaScript directly (e.g. 2 + 2, Math.sqrt(144))`,
          time,
        });
        break;

      case 'ls':
      case 'dir':
        const fileList = files
          .map(
            (f) =>
              `-rw-r--r-- 1 omni staff  ${f.content.length.toString().padStart(5, ' ')}B  ${f.name}`
          )
          .join('\n');
        newEntries.push({
          type: 'output',
          text: `total ${files.length} files\n${fileList}`,
          time,
        });
        break;

      case 'cat':
        if (!arg) {
          newEntries.push({ type: 'error', text: 'Usage: cat <filename>', time });
        } else {
          const target = files.find(
            (f) => f.name.toLowerCase() === arg.toLowerCase() || f.path.toLowerCase() === arg.toLowerCase()
          );
          if (target) {
            newEntries.push({ type: 'output', text: target.content, time });
          } else {
            newEntries.push({ type: 'error', text: `cat: ${arg}: No such file`, time });
          }
        }
        break;

      case 'export':
      case 'zip':
        newEntries.push({
          type: 'system',
          text: '📦 Packaging all workspace files into clean .zip archive...',
          time,
        });
        onExportZip();
        break;

      case 'git':
        if (arg === 'status') {
          newEntries.push({
            type: 'output',
            text: `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges to be committed:\n  (use "export" to download snapshot)\n\n\tmodified:   ${files
              .map((f) => f.name)
              .join('\n\tmodified:   ')}\n\nno untracked files.`,
            time,
          });
        } else {
          newEntries.push({
            type: 'output',
            text: `git: '${arg}' is simulated in OmniCode Studio. All files are live-synced.`,
            time,
          });
        }
        break;

      case 'node':
      case 'run':
        if (!arg) {
          newEntries.push({ type: 'error', text: 'Usage: run <filename> or node <filename>', time });
        } else {
          const fileToRun = files.find(
            (f) => f.name.toLowerCase() === arg.toLowerCase() || f.path.toLowerCase() === arg.toLowerCase()
          );
          if (fileToRun) {
            try {
              newEntries.push({
                type: 'system',
                text: `[Runtime] Executing ${fileToRun.name}...`,
                time,
              });
              // Safe evaluation for console statements
              const outputLogs: string[] = [];
              const customConsole = {
                log: (...args: any[]) => outputLogs.push(args.map(String).join(' ')),
                info: (...args: any[]) => outputLogs.push(`[INFO] ${args.map(String).join(' ')}`),
                warn: (...args: any[]) => outputLogs.push(`[WARN] ${args.map(String).join(' ')}`),
                error: (...args: any[]) => outputLogs.push(`[ERROR] ${args.map(String).join(' ')}`),
              };
              const runner = new Function('console', fileToRun.content);
              runner(customConsole);

              newEntries.push({
                type: 'output',
                text: outputLogs.length > 0 ? outputLogs.join('\n') : '(Program finished with exit code 0)',
                time,
              });
            } catch (err: any) {
              newEntries.push({
                type: 'error',
                text: `Runtime Exception: ${err.message}`,
                time,
              });
            }
          } else {
            newEntries.push({ type: 'error', text: `File not found: ${arg}`, time });
          }
        }
        break;

      case 'python':
      case 'py':
        newEntries.push({
          type: 'system',
          text: `[Python 3.12 Engine] Executing ${arg || 'script.py'}...`,
          time,
        });
        const pyFile = files.find((f) => f.name.endsWith('.py'));
        if (pyFile) {
          newEntries.push({
            type: 'output',
            text: `Python Execution Complete:\n>> Processed algorithms and data structures successfully.\n>> Exit Code: 0 (OK)`,
            time,
          });
        } else {
          newEntries.push({
            type: 'output',
            text: `Python 3.12.0 (main, Oct 2026)\n[OmniCode Sandbox Ready] Run python scripts or evaluate algorithms.`,
            time,
          });
        }
        break;

      default:
        // Attempt JS Expression evaluation
        try {
          // eslint-disable-next-line no-eval
          const result = eval(rawCmd);
          newEntries.push({
            type: 'output',
            text: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
            time,
          });
        } catch (evalErr: any) {
          newEntries.push({
            type: 'error',
            text: `zsh: command not found or invalid syntax: ${rawCmd}\nType "help" for a list of commands.`,
            time,
          });
        }
    }

    setHistory(newEntries);
    setCommandInput('');
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.type === logFilter;
  });

  return (
    <div
      className={`border-t border-slate-800 bg-[#090c13] flex flex-col font-mono text-xs select-none transition-all duration-150 ${
        isExpanded ? 'h-96' : 'h-52'
      }`}
    >
      {/* Header bar */}
      <div className="h-8 bg-[#0e121c] border-b border-slate-800/80 px-3 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50'
                : 'hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-3 h-3 text-indigo-400" />
            <span>Interactive Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              activeTab === 'console'
                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50'
                : 'hover:text-slate-200'
            }`}
          >
            <span>Live Console ({logs.length})</span>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1">
          {activeTab === 'console' && (
            <>
              {/* Filter pills */}
              <div className="flex items-center gap-1 mr-2 text-[10px]">
                {(['all', 'log', 'warn', 'error'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`px-1.5 py-0.5 rounded uppercase ${
                      logFilter === filter
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button
                onClick={onClearLogs}
                title="Clear console logs"
                className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 text-slate-400 mr-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 text-slate-400 cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            title="Close Panel"
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 text-slate-400 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal View */}
      {activeTab === 'terminal' && (
        <div className="flex-1 flex flex-col overflow-hidden p-2 text-slate-200">
          <div className="flex-1 overflow-y-auto space-y-1 select-text">
            {history.map((item, idx) => (
              <div key={idx} className="leading-5">
                {item.type === 'cmd' ? (
                  <div className="text-indigo-400 font-semibold">{item.text}</div>
                ) : item.type === 'error' ? (
                  <div className="text-rose-400 whitespace-pre-wrap">{item.text}</div>
                ) : item.type === 'system' ? (
                  <div className="text-slate-500 italic whitespace-pre-wrap">{item.text}</div>
                ) : (
                  <div className="text-slate-300 whitespace-pre-wrap">{item.text}</div>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Shell Input Row */}
          <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
            <span className="text-indigo-400 font-bold">$</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Type command (ls, cat script.js, run script.js, 2+2) or 'help'..."
              className="flex-1 bg-transparent text-slate-100 outline-none text-xs font-mono"
            />
            <CornerDownLeft className="w-3 h-3 text-slate-600" />
          </form>
        </div>
      )}

      {/* Live Console Logs View */}
      {activeTab === 'console' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1 select-text">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 py-4 text-center">
              No console logs captured yet. Logs from the live browser preview appear here in real-time.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const getIcon = () => {
                switch (log.type) {
                  case 'warn':
                    return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
                  case 'error':
                    return <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
                  case 'info':
                    return <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
                  default:
                    return <span className="text-slate-500 text-[10px]">›</span>;
                }
              };

              const getStyle = () => {
                switch (log.type) {
                  case 'warn':
                    return 'text-amber-300 bg-amber-950/20 border-l-2 border-amber-500';
                  case 'error':
                    return 'text-rose-300 bg-rose-950/20 border-l-2 border-rose-500';
                  case 'info':
                    return 'text-sky-300';
                  default:
                    return 'text-slate-300';
                }
              };

              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-0.5 px-2 rounded text-[11px] leading-5 ${getStyle()}`}
                >
                  <div className="mt-0.5">{getIcon()}</div>
                  <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                  <span className="flex-1 whitespace-pre-wrap break-all">{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={consoleEndRef} />
        </div>
      )}
    </div>
  );
};
