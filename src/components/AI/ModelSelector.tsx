import React from 'react';
import { AIModel } from '../../types';
import { Sparkles, Terminal, ShieldAlert, Cpu } from 'lucide-react';

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gemini-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Pro Reasoning',
    provider: 'Google AI',
    avatar: '⚡',
    tagline: 'Full-stack generation, reasoning & refactoring',
    description:
      'Excels at end-to-end web applications, architectural planning, and intelligent code transformations.',
    specialties: ['Full-stack App Gen', 'Architecture Design', 'Deep Refactoring'],
    color: 'from-blue-600 to-indigo-600',
    accent: 'text-indigo-400 border-indigo-500',
  },
  {
    id: 'chatgpt-codex',
    name: 'ChatGPT / Codex 4o',
    badge: 'Algo Specialist',
    provider: 'OpenAI Engine',
    avatar: '🤖',
    tagline: 'Pure algorithm design & syntax translation',
    description:
      'Fine-tuned for algorithmic problem solving, complex math, and cross-language syntax conversion.',
    specialties: ['Algorithms & Data Structures', 'Cross-Language Syntax', 'Math Computations'],
    color: 'from-emerald-600 to-teal-600',
    accent: 'text-emerald-400 border-emerald-500',
  },
  {
    id: 'cloud-agent',
    name: 'Cloud AI SecOps Agent',
    badge: 'Security & Audit',
    provider: 'OmniSec Guard',
    avatar: '🛡️',
    tagline: 'Vulnerability audits, memory leaks & DevOps',
    description:
      'Performs real-time static code analysis, CVSS vulnerability assessments, and performance optimization.',
    specialties: ['CVSS Vulnerability Audits', 'Memory Leak Analysis', 'Clean Code Compliance'],
    color: 'from-purple-600 to-rose-600',
    accent: 'text-purple-400 border-purple-500',
  },
];

interface ModelSelectorProps {
  activeModel: AIModel;
  onSelectModel: (model: AIModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  activeModel,
  onSelectModel,
}) => {
  return (
    <div className="p-3 bg-[#0d1017] border-b border-slate-800/80">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Select AI Model Persona
        </span>
        <span className="text-[10px] text-indigo-400 font-mono">
          {activeModel.provider}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {AVAILABLE_MODELS.map((model) => {
          const isActive = activeModel.id === model.id;
          return (
            <button
              key={model.id}
              onClick={() => onSelectModel(model)}
              className={`flex flex-col items-start p-2 rounded-xl text-left border transition cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                  : 'bg-[#121622] border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                  <div className="absolute transform rotate-45 bg-indigo-500 text-white font-bold py-0.5 right-[-35px] top-[18px] w-[100px]"></div>
                </div>
              )}
              <div className="flex items-center gap-1.5 w-full mb-1">
                <span className="text-sm">{model.avatar}</span>
                <span className="font-semibold text-xs text-slate-100 truncate flex-1">
                  {model.name.split(' ')[0]}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                {model.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Model Spec Card */}
      <div className="mt-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-slate-200">{activeModel.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">
            {activeModel.specialties[0]}
          </span>
        </div>
        <p className="text-slate-400 text-[11px] leading-4">
          {activeModel.description}
        </p>
      </div>
    </div>
  );
};
