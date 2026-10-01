import React, { useState, useEffect, useCallback } from 'react';
import {
  ProjectFile,
  AIModel,
  ChatMessage,
  ConsoleLog,
  DiffProposal,
  UserSettings,
  MobileViewTab,
} from './types';
import { STARTER_PROJECTS, getLanguageFromFilename } from './utils/fileTemplates';
import { exportProjectAsZip } from './utils/zipExport';
import { AVAILABLE_MODELS } from './components/AI/ModelSelector';
import { AppHeader } from './components/Header/AppHeader';
import { ActivityBar, SidebarTab } from './components/Sidebar/ActivityBar';
import { FileExplorer } from './components/Sidebar/FileExplorer';
import { SearchPanel } from './components/Sidebar/SearchPanel';
import { CodeEditor } from './components/Editor/CodeEditor';
import { LivePreview } from './components/Preview/LivePreview';
import { TerminalPanel } from './components/Terminal/TerminalPanel';
import { AIAssistantPanel } from './components/AI/AIAssistantPanel';
import { MobileNavBar } from './components/Mobile/MobileNavBar';
import { MobileCodeAccessoryBar } from './components/Mobile/MobileCodeAccessoryBar';
import { SettingsModal } from './components/Modals/SettingsModal';
import { NewFileModal } from './components/Modals/NewFileModal';
import { CreateFromScratchModal } from './components/Modals/CreateFromScratchModal';
import { Eye, Code, Split, Sparkles, Layers, CheckCircle2, X, RotateCcw, ShieldCheck, Rocket } from 'lucide-react';

const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  openAiApiKey: '',
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  autoPreview: true,
  autoPreviewDelay: 600,
};

export default function App() {
  // --- Workspace State ---
  const [selectedTemplate, setSelectedTemplate] = useState<string>('nebula');
  const [files, setFiles] = useState<ProjectFile[]>(() => {
    const saved = localStorage.getItem('omnicode_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved files', e);
      }
    }
    return STARTER_PROJECTS.nebula.files;
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return files[0]?.id || '';
  });

  const [openFileIds, setOpenFileIds] = useState<string[]>(() => {
    return files.map((f) => f.id).slice(0, 4);
  });

  // --- Panels & Layout State ---
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'editor-only' | 'preview-only'>('split');
  const [mobileTab, setMobileTab] = useState<MobileViewTab>('editor');

  // --- Permissions & Auto-Fix & From-Scratch State ---
  const [filePermissionsGranted, setFilePermissionsGranted] = useState(true);
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);
  const [isCreateFromScratchOpen, setIsCreateFromScratchOpen] = useState(false);
  const [lastModifiedTimestamp, setLastModifiedTimestamp] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [lastAutoFixToast, setLastAutoFixToast] = useState<{
    fileId: string;
    fileName: string;
    previousContent: string;
  } | null>(null);

  // --- AI Model State ---
  const [activeModel, setActiveModel] = useState<AIModel>(AVAILABLE_MODELS[0]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);

  // --- Terminal & Logs ---
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);

  // --- Diff Proposal ---
  const [diffProposal, setDiffProposal] = useState<DiffProposal>({
    active: false,
    fileId: '',
    originalSnippet: '',
    proposedSnippet: '',
    startLine: 1,
    endLine: 1,
    explanation: '',
  });

  // --- Settings & Modals ---
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('omnicode_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasServerGeminiKey, setHasServerGeminiKey] = useState(false);

  // Check health and server configuration
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasServerGeminiKey(Boolean(data.hasGeminiEnvKey));
      })
      .catch((err) => console.warn('Health check warning:', err));
  }, []);

  // Save files to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('omnicode_files', JSON.stringify(files));
    } catch (e) {}
  }, [files]);

  // Save settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('omnicode_settings', JSON.stringify(newSettings));
  };

  // Active File Reference
  const activeFile = files.find((f) => f.id === activeFileId) || files[0] || null;
  const openFiles = files.filter((f) => openFileIds.includes(f.id));

  // Switch Template
  const handleSelectTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = STARTER_PROJECTS[templateKey];
    if (template) {
      setFiles(template.files);
      setActiveFileId(template.files[0]?.id || '');
      setOpenFileIds(template.files.map((f) => f.id));
      setLastModifiedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setConsoleLogs([]);
      setChatMessages([
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Loaded **${template.name}**!\n${template.description}\n\nYou can edit code, check the live preview on the right, or click **"Build From Scratch"** to construct an entirely new site or app!`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  // File Operations
  const handleSelectFile = (file: ProjectFile) => {
    setActiveFileId(file.id);
    if (!openFileIds.includes(file.id)) {
      setOpenFileIds((prev) => [...prev, file.id]);
    }
    setMobileTab('editor');
  };

  const handleCloseFile = (fileId: string) => {
    const nextOpen = openFileIds.filter((id) => id !== fileId);
    setOpenFileIds(nextOpen);
    if (activeFileId === fileId && nextOpen.length > 0) {
      setActiveFileId(nextOpen[nextOpen.length - 1]);
    }
  };

  const handleCreateFile = (name: string, content = '') => {
    const language = getLanguageFromFilename(name);
    const newFile: ProjectFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      path: name,
      language,
      content: content || `// ${name}\n\n`,
      isModified: false,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setOpenFileIds((prev) => [...prev, newFile.id]);
    setLastModifiedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setMobileTab('editor');
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setLastModifiedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    handleCloseFile(fileId);
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              name: newName,
              path: newName,
              language: getLanguageFromFilename(newName),
            }
          : f
      )
    );
    setLastModifiedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleUpdateContent = (fileId: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content, isModified: true } : f))
    );
    setLastModifiedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // Insert symbol for mobile accessory bar
  const handleInsertSymbol = (symbol: string) => {
    if (!activeFile) return;
    const updated = activeFile.content + symbol;
    handleUpdateContent(activeFile.id, updated);
  };

  // Upload Files / Folders
  const handleUploadFiles = async (uploadedFiles: FileList) => {
    const newFiles: ProjectFile[] = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (file.name.startsWith('.')) continue;

      const relativePath = file.webkitRelativePath || file.name;
      const text = await file.text();
      newFiles.push({
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        path: relativePath,
        content: text,
        language: getLanguageFromFilename(file.name),
      });
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      setActiveFileId(newFiles[0].id);
      setOpenFileIds((prev) => [...prev, ...newFiles.map((f) => f.id)]);
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          type: 'info',
          message: `Imported ${newFiles.length} file(s) into workspace.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setMobileTab('editor');
    }
  };

  // ZIP Export
  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      await exportProjectAsZip(files, 'omnicode-studio-project');
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          type: 'info',
          message: `Clean project .zip exported successfully.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      console.error('ZIP Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Console Log handler from iframe
  const handleLog = useCallback((log: Omit<ConsoleLog, 'id' | 'timestamp'>) => {
    setConsoleLogs((prev) => [
      ...prev,
      {
        ...log,
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  // Inspect Element Action
  const handleInspectElement = ({
    tagName,
    html,
    selector,
  }: {
    tagName: string;
    html: string;
    selector: string;
  }) => {
    setIsAIPanelOpen(true);
    setMobileTab('ai');
    const inspectPrompt = `I clicked on the DOM element \`<${tagName}>\` (\`${selector}\`):\n\`\`\`html\n${html}\n\`\`\`\nPlease fix or improve this element and update the code directly in our project file.`;
    handleSendMessage(inspectPrompt);
  };

  // AI Send Message
  const handleSendMessage = async (
    userText: string,
    taskType = 'chat',
    customContext?: any
  ): Promise<string | void> => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAILoading(true);

    try {
      const activeFileContext = customContext || {
        fileName: activeFile?.name,
        fileLanguage: activeFile?.language,
        fileContent: activeFile?.content,
        highlightedCode: customContext?.highlightedCode,
      };

      const customApiKey =
        activeModel.id === 'chatgpt-codex'
          ? settings.openAiApiKey
          : settings.geminiApiKey;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel.id,
          taskType,
          messages: [...chatMessages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: activeFileContext,
          customApiKey,
        }),
      });

      const data = await response.json();
      const replyContent = data.content || 'No response returned from model.';

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString(),
        modelId: activeModel.id,
        isLive: data.isLive,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);

      // If user selected inline-edit on highlighted code
      if (
        (taskType === 'inline-edit' || taskType === 'refactor') &&
        customContext?.highlightedCode
      ) {
        const codeBlockMatch = replyContent.match(/```(?:\w+)?\n([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          setDiffProposal({
            active: true,
            fileId: activeFile?.id || '',
            originalSnippet: customContext.highlightedCode,
            proposedSnippet: codeBlockMatch[1].trim(),
            startLine: customContext.startLine || 1,
            endLine: customContext.endLine || 1,
            explanation: replyContent.split('```')[2]?.trim() || 'AI refactored replacement snippet.',
          });
        }
      }

      // AUTOMATIC CODE FIX & MULTI-FILE APPLICATION WITH DIRECT PERMISSIONS
      if (autoFixEnabled && filePermissionsGranted) {
        // 1. Check for multiple [FILE: filename] blocks (Create from scratch with multiple files)
        const fileBlockRegex = /\[FILE:\s*([a-zA-Z0-9_.-]+)\][\s\S]*?```(?:\w+)?\n([\s\S]*?)```/g;
        let fileMatch;
        const parsedFiles: Array<{ name: string; content: string }> = [];
        while ((fileMatch = fileBlockRegex.exec(replyContent)) !== null) {
          parsedFiles.push({
            name: fileMatch[1].trim(),
            content: fileMatch[2].trim(),
          });
        }

        if (parsedFiles.length > 0) {
          // Multiple files created from scratch!
          setFiles((prev) => {
            let nextFiles = [...prev];
            parsedFiles.forEach((pf) => {
              const existingIdx = nextFiles.findIndex(
                (f) => f.name.toLowerCase() === pf.name.toLowerCase()
              );
              if (existingIdx >= 0) {
                nextFiles[existingIdx] = {
                  ...nextFiles[existingIdx],
                  content: pf.content,
                  isModified: true,
                };
              } else {
                nextFiles.push({
                  id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  name: pf.name,
                  path: pf.name,
                  language: getLanguageFromFilename(pf.name),
                  content: pf.content,
                  isModified: true,
                });
              }
            });
            return nextFiles;
          });

          // Focus on index.html if created, else first file
          const primaryFile = parsedFiles.find((f) => f.name === 'index.html') || parsedFiles[0];
          setTimeout(() => {
            setFiles((currentFiles) => {
              const found = currentFiles.find((f) => f.name === primaryFile.name);
              if (found) {
                setActiveFileId(found.id);
                setOpenFileIds((prev) => (prev.includes(found.id) ? prev : [...prev, found.id]));
              }
              return currentFiles;
            });
          }, 60);

          setLastAutoFixToast({
            fileId: activeFile?.id || '',
            fileName: `${parsedFiles.length} project files`,
            previousContent: activeFile?.content || '',
          });

          setConsoleLogs((prev) => [
            ...prev,
            {
              id: `log-${Date.now()}`,
              type: 'info',
              message: `🚀 [Build From Scratch] Successfully created ${parsedFiles.length} file(s) (${parsedFiles.map((f) => f.name).join(', ')}). Live preview updated!`,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);

          // Switch to live preview so user immediately sees their created app!
          setMobileTab('preview');
        } else {
          // Single code block returned
          const codeBlockMatch = replyContent.match(/```(?:\w+)?\n([\s\S]*?)```/);
          if (codeBlockMatch && codeBlockMatch[1]) {
            const fixedCode = codeBlockMatch[1].trim();

            const isFromScratch = /\b(scratch|create|build|make)\s+(an?|the)?\s*(app|site|website|game|tool|page)\b/i.test(
              userText
            );
            const mentionedFile = files.find((f) =>
              new RegExp(`\\b${f.name.replace('.', '\\.')}\\b`, 'i').test(userText)
            );

            // If creating an app from scratch and target is HTML, target index.html!
            let targetFile = mentionedFile;
            if (!targetFile && isFromScratch) {
              targetFile = files.find((f) => f.name === 'index.html') || activeFile;
            } else if (!targetFile) {
              targetFile = activeFile;
            }

            if (targetFile) {
              setLastAutoFixToast({
                fileId: targetFile.id,
                fileName: targetFile.name,
                previousContent: targetFile.content,
              });

              handleUpdateContent(targetFile.id, fixedCode);

              if (targetFile.id !== activeFileId) {
                setActiveFileId(targetFile.id);
                if (!openFileIds.includes(targetFile.id)) {
                  setOpenFileIds((prev) => [...prev, targetFile.id]);
                }
              }

              setConsoleLogs((prev) => [
                ...prev,
                {
                  id: `log-${Date.now()}`,
                  type: 'info',
                  message: isFromScratch
                    ? `🚀 [Build From Scratch] Generated new application in "${targetFile.name}". Live preview updated!`
                    : `⚡ [File Permissions Active] Automatically fixed and updated "${targetFile.name}".`,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);

              if (isFromScratch) {
                setMobileTab('preview');
              }
            }
          }
        }
      }

      return replyContent;
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `⚠️ Error contacting ${activeModel.name}: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
          status: 'error',
        },
      ]);
    } finally {
      setIsAILoading(false);
    }
  };

  // Apply Diff Proposal
  const handleApplyDiff = () => {
    if (!diffProposal.active || !activeFile) return;
    const { originalSnippet, proposedSnippet } = diffProposal;
    if (activeFile.content.includes(originalSnippet)) {
      const updated = activeFile.content.replace(originalSnippet, proposedSnippet);
      handleUpdateContent(activeFile.id, updated);
    }
    setDiffProposal((prev) => ({ ...prev, active: false }));
  };

  // Direct Code Insertion: Supports both replacing entire file or inserting at cursor/end
  const handleApplyCodeToFile = (code: string, mode: 'replace' | 'insert' = 'replace') => {
    if (!activeFile) return;
    if (mode === 'replace') {
      handleUpdateContent(activeFile.id, code);
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          type: 'info',
          message: `⚡ Successfully updated ${activeFile.name} with AI code.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      const updated = activeFile.content ? `${activeFile.content}\n\n${code}` : code;
      handleUpdateContent(activeFile.id, updated);
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          type: 'info',
          message: `📥 Inserted AI code into ${activeFile.name}.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
    setMobileTab('editor');
  };

  // Open Popout Preview
  const handleOpenPopoutPreview = () => {
    const htmlFile = files.find((f) => f.name === 'index.html') || files[0];
    const newWin = window.open('', '_blank');
    if (newWin && htmlFile) {
      newWin.document.write(htmlFile.content);
      newWin.document.close();
    }
  };

  const consoleErrorCount = consoleLogs.filter((l) => l.type === 'error').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090b10] text-slate-100 font-sans relative">
      {/* Top Application Header */}
      <AppHeader
        files={files}
        activeFile={activeFile}
        onExportZip={handleExportZip}
        isExporting={isExporting}
        onRunPreview={() => {
          setFiles((prev) => [...prev]);
          setConsoleLogs((prev) => [
            ...prev,
            {
              id: `log-${Date.now()}`,
              type: 'system',
              message: '⚡ Manual rebuild and preview refreshed.',
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
          setMobileTab('preview');
        }}
        isAIPanelOpen={isAIPanelOpen}
        setIsAIPanelOpen={setIsAIPanelOpen}
        isTerminalOpen={isTerminalOpen}
        setIsTerminalOpen={setIsTerminalOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={handleSelectTemplate}
        onOpenPopoutPreview={handleOpenPopoutPreview}
        filePermissionsGranted={filePermissionsGranted}
        onTogglePermissions={setFilePermissionsGranted}
        onOpenCreateScratch={() => setIsCreateFromScratchOpen(true)}
      />

      {/* Floating Auto-Fix Confirmation & Revert Toast */}
      {lastAutoFixToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0f1b15] border border-emerald-500 rounded-xl shadow-2xl shadow-black/80 px-4 py-2.5 flex items-center gap-3 text-xs text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            AI automatically updated <strong className="text-white font-mono">{lastAutoFixToast.fileName}</strong>
          </span>
          <button
            onClick={() => {
              handleUpdateContent(lastAutoFixToast.fileId, lastAutoFixToast.previousContent);
              setLastAutoFixToast(null);
              setConsoleLogs((prev) => [
                ...prev,
                {
                  id: `log-${Date.now()}`,
                  type: 'system',
                  message: `↩️ Undid automatic code changes on ${lastAutoFixToast.fileName}.`,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-[11px] transition cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
          <button
            onClick={() => setLastAutoFixToast(null)}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Leftmost Activity Bar */}
        <div className="hidden md:flex">
          <ActivityBar
            activeTab={sidebarTab}
            setActiveTab={(tab) => {
              setSidebarTab(tab);
            }}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>

        {/* Collapsible Sidebar Drawer (Explorer, Search, Templates) */}
        {isSidebarOpen && (
          <aside className="hidden md:flex w-60 bg-[#0e121a] border-r border-slate-800/80 flex-col h-full shrink-0 z-20">
            {sidebarTab === 'explorer' && (
              <FileExplorer
                files={files}
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                onCreateFile={(name, content) => handleCreateFile(name, content)}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                onUploadFiles={handleUploadFiles}
                onExportZip={handleExportZip}
                isExporting={isExporting}
                lastModifiedTimestamp={lastModifiedTimestamp}
              />
            )}

            {sidebarTab === 'search' && (
              <SearchPanel
                files={files}
                onSelectFile={handleSelectFile}
                onUpdateFileContent={handleUpdateContent}
              />
            )}

            {sidebarTab === 'templates' && (
              <div className="p-3 space-y-3 overflow-y-auto text-xs">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider block">
                    Starter Projects
                  </span>
                  <button
                    onClick={() => setIsCreateFromScratchOpen(true)}
                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Create Custom</span>
                  </button>
                </div>
                {Object.entries(STARTER_PROJECTS).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col gap-1 ${
                      selectedTemplate === key
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-semibold text-slate-200">
                      {template.name}
                    </span>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {template.description}
                    </p>
                    <span className="text-[10px] text-indigo-400 font-mono mt-1">
                      {template.files.length} files
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>
        )}

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Desktop View mode toggle pill in header */}
          <div className="hidden md:flex h-7 bg-[#0b0e15] border-b border-slate-800/60 px-3 items-center justify-between text-[11px] text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-300">Workspace View:</span>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'hover:text-slate-200'
                  }`}
                >
                  <Split className="w-3 h-3" />
                  <span>Split Editor & Preview</span>
                </button>
                <button
                  onClick={() => setViewMode('editor-only')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer ${
                    viewMode === 'editor-only'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Editor Only</span>
                </button>
                <button
                  onClick={() => setViewMode('preview-only')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer ${
                    viewMode === 'preview-only'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview Only</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
              <button
                onClick={() => setIsCreateFromScratchOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Build From Scratch</span>
              </button>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Auto-Create & Permissions Active
              </span>
            </div>
          </div>

          {/* DESKTOP CONTENT VIEW */}
          <div className="hidden md:flex flex-1 flex-col overflow-hidden relative">
            <div className="flex-1 flex flex-row overflow-hidden relative">
              {/* Editor Canvas */}
              {viewMode !== 'preview-only' && (
                <div
                  className={`flex flex-col overflow-hidden ${
                    viewMode === 'split'
                      ? 'w-1/2 border-r border-slate-800/80'
                      : 'w-full'
                  }`}
                >
                  <CodeEditor
                    openFiles={openFiles}
                    activeFile={activeFile}
                    onSelectFile={handleSelectFile}
                    onCloseFile={handleCloseFile}
                    onNewFileClick={() => setIsNewFileModalOpen(true)}
                    onUpdateContent={handleUpdateContent}
                    activeModel={activeModel}
                    onAskAI={handleSendMessage}
                    diffProposal={diffProposal}
                    onApplyDiff={handleApplyDiff}
                    onDiscardDiff={() =>
                      setDiffProposal((prev) => ({ ...prev, active: false }))
                    }
                    settings={settings}
                    onRunCode={() => setFiles((prev) => [...prev])}
                  />
                </div>
              )}

              {/* Live Preview Sandbox */}
              {viewMode !== 'editor-only' && (
                <div
                  className={`flex flex-col overflow-hidden ${
                    viewMode === 'split' ? 'w-1/2' : 'w-full'
                  }`}
                >
                  <LivePreview
                    files={files}
                    onLog={handleLog}
                    onInspectElement={handleInspectElement}
                    onOpenPopout={handleOpenPopoutPreview}
                  />
                </div>
              )}
            </div>

            {/* Integrated Terminal & Console Log Panel */}
            {isTerminalOpen && (
              <TerminalPanel
                logs={consoleLogs}
                onClearLogs={() => setConsoleLogs([])}
                files={files}
                onExportZip={handleExportZip}
                onClose={() => setIsTerminalOpen(false)}
              />
            )}
          </div>

          {/* MOBILE CONTENT VIEW (100% Mobile Touch-Optimized) */}
          <div className="flex md:hidden flex-1 flex-col overflow-hidden relative">
            {mobileTab === 'editor' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <CodeEditor
                  openFiles={openFiles}
                  activeFile={activeFile}
                  onSelectFile={handleSelectFile}
                  onCloseFile={handleCloseFile}
                  onNewFileClick={() => setIsNewFileModalOpen(true)}
                  onUpdateContent={handleUpdateContent}
                  activeModel={activeModel}
                  onAskAI={handleSendMessage}
                  diffProposal={diffProposal}
                  onApplyDiff={handleApplyDiff}
                  onDiscardDiff={() =>
                    setDiffProposal((prev) => ({ ...prev, active: false }))
                  }
                  settings={settings}
                  onRunCode={() => {
                    setFiles((prev) => [...prev]);
                    setMobileTab('preview');
                  }}
                />
                {/* Mobile Code Keyboard Accessory Bar */}
                <MobileCodeAccessoryBar
                  onInsertSymbol={handleInsertSymbol}
                />
              </div>
            )}

            {mobileTab === 'preview' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <LivePreview
                  files={files}
                  onLog={handleLog}
                  onInspectElement={handleInspectElement}
                  onOpenPopout={handleOpenPopoutPreview}
                />
              </div>
            )}

            {mobileTab === 'ai' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <AIAssistantPanel
                  activeModel={activeModel}
                  onSelectModel={setActiveModel}
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isAILoading}
                  onClearChat={() => setChatMessages([])}
                  activeFile={activeFile}
                  onApplyCodeToFile={handleApplyCodeToFile}
                  onClose={() => setMobileTab('editor')}
                  autoFixEnabled={autoFixEnabled}
                  onToggleAutoFix={setAutoFixEnabled}
                  filePermissionsGranted={filePermissionsGranted}
                  onTogglePermissions={setFilePermissionsGranted}
                />
              </div>
            )}

            {mobileTab === 'files' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0e121a]">
                <FileExplorer
                  files={files}
                  activeFile={activeFile}
                  onSelectFile={handleSelectFile}
                  onCreateFile={(name, content) => handleCreateFile(name, content)}
                  onDeleteFile={handleDeleteFile}
                  onRenameFile={handleRenameFile}
                  onUploadFiles={handleUploadFiles}
                  onExportZip={handleExportZip}
                  isExporting={isExporting}
                  lastModifiedTimestamp={lastModifiedTimestamp}
                />
              </div>
            )}

            {mobileTab === 'terminal' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <TerminalPanel
                  logs={consoleLogs}
                  onClearLogs={() => setConsoleLogs([])}
                  files={files}
                  onExportZip={handleExportZip}
                  onClose={() => setMobileTab('editor')}
                />
              </div>
            )}
          </div>
        </main>

        {/* Desktop Multi-Model AI Assistant Panel */}
        {isAIPanelOpen && (
          <div className="hidden md:flex">
            <AIAssistantPanel
              activeModel={activeModel}
              onSelectModel={setActiveModel}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isAILoading}
              onClearChat={() => setChatMessages([])}
              activeFile={activeFile}
              onApplyCodeToFile={handleApplyCodeToFile}
              onClose={() => setIsAIPanelOpen(false)}
              autoFixEnabled={autoFixEnabled}
              onToggleAutoFix={setAutoFixEnabled}
              filePermissionsGranted={filePermissionsGranted}
              onTogglePermissions={setFilePermissionsGranted}
            />
          </div>
        )}
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNavBar
        activeTab={mobileTab}
        onSelectTab={setMobileTab}
        consoleErrorCount={consoleErrorCount}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        hasServerGeminiKey={hasServerGeminiKey}
      />

      {/* New File Modal */}
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onCreate={(fileName) => handleCreateFile(fileName)}
      />

      {/* Create From Scratch Modal */}
      <CreateFromScratchModal
        isOpen={isCreateFromScratchOpen}
        onClose={() => setIsCreateFromScratchOpen(false)}
        onGenerateApp={(prompt) => {
          setIsAIPanelOpen(true);
          handleSendMessage(prompt);
        }}
      />
    </div>
  );
}
