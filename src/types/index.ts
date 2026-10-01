export type SupportedLanguage =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'json'
  | 'markdown'
  | 'sql'
  | 'text';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: SupportedLanguage;
  isModified?: boolean;
}

export interface AIModel {
  id: 'gemini-flash' | 'chatgpt-codex' | 'cloud-agent';
  name: string;
  badge: string;
  provider: string;
  avatar: string;
  tagline: string;
  description: string;
  specialties: string[];
  color: string;
  accent: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelId?: string;
  fileName?: string;
  highlightedCode?: string;
  isLive?: boolean;
  status?: 'sending' | 'done' | 'error';
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'system' | 'eval';
  message: string;
  timestamp: string;
  fileSource?: string;
}

export interface DiffProposal {
  active: boolean;
  fileId: string;
  originalSnippet: string;
  proposedSnippet: string;
  startLine: number;
  endLine: number;
  explanation: string;
}

export interface UserSettings {
  geminiApiKey: string;
  openAiApiKey: string;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoPreview: boolean;
  autoPreviewDelay: number;
}

export type MobileViewTab = 'editor' | 'preview' | 'ai' | 'files' | 'terminal';
