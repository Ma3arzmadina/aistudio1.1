import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Crosshair,
  AlertCircle,
  CheckCircle2,
  Code,
} from 'lucide-react';
import { ProjectFile, ConsoleLog } from '../../types';

interface LivePreviewProps {
  files: ProjectFile[];
  onLog: (log: Omit<ConsoleLog, 'id' | 'timestamp'>) => void;
  onInspectElement?: (elementInfo: { tagName: string; html: string; selector: string }) => void;
  onOpenPopout: () => void;
}

type DeviceMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  onLog,
  onInspectElement,
  onOpenPopout,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [key, setKey] = useState(0);
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [hasRuntimeError, setHasRuntimeError] = useState<string | null>(null);

  // Compile project files into a bundled HTML document
  const compileProjectSource = (): string => {
    const htmlFile =
      files.find((f) => f.name === 'index.html' || f.language === 'html') ||
      files.find((f) => f.name.endsWith('.html')) ||
      {
        content: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;color:#333"><h1>No index.html found</h1></body></html>`,
      };

    let docHtml = htmlFile.content;

    // Inline CSS files
    const cssFiles = files.filter((f) => f.language === 'css' || f.name.endsWith('.css'));
    const combinedCss = cssFiles.map((f) => f.content).join('\n\n');

    // Inline JS files (excluding test files)
    const jsFiles = files.filter(
      (f) =>
        (f.language === 'javascript' || f.name.endsWith('.js')) &&
        !f.name.includes('.test.')
    );
    const combinedJs = jsFiles.map((f) => f.content).join('\n\n');

    // Injected instrumentation script: captures console messages, runtime errors, and element inspector clicks
    const injectionScript = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          const originalInfo = console.info;

          function sendLog(type, args) {
            try {
              const msg = Array.from(args).map(a => {
                if (typeof a === 'object') {
                  try { return JSON.stringify(a); } catch(e) { return String(a); }
                }
                return String(a);
              }).join(' ');

              window.parent.postMessage({
                source: 'omnicode-sandbox',
                type: type,
                message: msg
              }, '*');
            } catch(e) {}
          }

          console.log = function(...args) {
            originalLog.apply(console, args);
            sendLog('log', args);
          };
          console.warn = function(...args) {
            originalWarn.apply(console, args);
            sendLog('warn', args);
          };
          console.error = function(...args) {
            originalError.apply(console, args);
            sendLog('error', args);
          };
          console.info = function(...args) {
            originalInfo.apply(console, args);
            sendLog('info', args);
          };

          window.addEventListener('error', function(e) {
            sendLog('error', [e.message + ' at ' + (e.filename || '') + ':' + (e.lineno || '')]);
          });

          window.addEventListener('unhandledrejection', function(e) {
            sendLog('error', ['Unhandled Promise Rejection: ' + (e.reason?.message || e.reason || 'Unknown')]);
          });

          // Element Inspector
          window.__inspectorActive = ${isInspectMode};
          let hoveredEl = null;

          window.addEventListener('mouseover', function(e) {
            if (!window.__inspectorActive) return;
            e.stopPropagation();
            if (hoveredEl && hoveredEl !== e.target) {
              hoveredEl.style.outline = '';
            }
            hoveredEl = e.target;
            hoveredEl.style.outline = '2px solid #6366f1';
            hoveredEl.style.cursor = 'crosshair';
          }, true);

          window.addEventListener('mouseout', function(e) {
            if (!window.__inspectorActive) return;
            if (e.target && e.target.style) {
              e.target.style.outline = '';
            }
          }, true);

          window.addEventListener('click', function(e) {
            if (!window.__inspectorActive) return;
            e.preventDefault();
            e.stopPropagation();
            if (e.target && e.target.style) {
              e.target.style.outline = '';
            }
            const el = e.target;
            const tagName = el.tagName.toLowerCase();
            const id = el.id ? '#' + el.id : '';
            const className = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '';
            const selector = tagName + id + className;

            window.parent.postMessage({
              source: 'omnicode-sandbox',
              type: 'element-inspect',
              tagName: tagName,
              html: el.outerHTML,
              selector: selector
            }, '*');
          }, true);
        })();
      </script>
    `;

    // Inject CSS
    if (combinedCss) {
      const styleTag = `<style id="omnicode-injected-styles">\n${combinedCss}\n</style>`;
      if (docHtml.includes('</head>')) {
        docHtml = docHtml.replace('</head>', `${styleTag}\n</head>`);
      } else {
        docHtml = `${styleTag}\n${docHtml}`;
      }
    }

    // Inject Instrumentation + JS
    const jsPayload = `\n${injectionScript}\n<script id="omnicode-injected-script">\n${combinedJs}\n</script>\n`;
    if (docHtml.includes('</body>')) {
      docHtml = docHtml.replace('</body>', `${jsPayload}</body>`);
    } else {
      docHtml = `${docHtml}\n${jsPayload}`;
    }

    return docHtml;
  };

  // Listen to postMessage from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'omnicode-sandbox') {
        const { type, message, tagName, html, selector } = event.data;

        if (type === 'element-inspect' && onInspectElement) {
          onInspectElement({ tagName, html, selector });
          setIsInspectMode(false);
          return;
        }

        if (type === 'error') {
          setHasRuntimeError(message);
        }

        onLog({
          type: type || 'log',
          message: message || '',
          fileSource: 'Live Sandbox',
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLog, onInspectElement]);

  const handleManualRefresh = () => {
    setHasRuntimeError(null);
    setKey((prev) => prev + 1);
  };

  const getViewportDimensions = () => {
    switch (deviceMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '100%' };
      case 'laptop':
        return { width: '1024px', height: '100%' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const dims = getViewportDimensions();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0c12] overflow-hidden select-none">
      {/* Preview Subheader Toolbar */}
      <div className="h-9 bg-[#0e121a] border-b border-slate-800/80 px-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Browser Preview</span>
          </span>

          {/* Inspect & Edit Element toggle */}
          <button
            onClick={() => {
              setIsInspectMode((prev) => !prev);
              setKey((prev) => prev + 1);
            }}
            title="Inspect & Edit Element: Click any element in preview to prompt AI about it"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              isInspectMode
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>{isInspectMode ? 'Inspecting...' : 'Inspect Element'}</span>
          </button>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setDeviceMode('desktop')}
            title="Desktop 100%"
            className={`p-1 rounded ${
              deviceMode === 'desktop'
                ? 'bg-indigo-600 text-white'
                : 'hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('laptop')}
            title="Laptop (1024px)"
            className={`p-1 rounded ${
              deviceMode === 'laptop'
                ? 'bg-indigo-600 text-white'
                : 'hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            title="Tablet (768px)"
            className={`p-1 rounded ${
              deviceMode === 'tablet'
                ? 'bg-indigo-600 text-white'
                : 'hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            title="Mobile (375px)"
            className={`p-1 rounded ${
              deviceMode === 'mobile'
                ? 'bg-indigo-600 text-white'
                : 'hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Refresh & Popout */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleManualRefresh}
            title="Reload Preview"
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenPopout}
            title="Open in new window"
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Runtime Error Banner if caught */}
      {hasRuntimeError && (
        <div className="bg-rose-950/80 border-b border-rose-800/80 px-3 py-1.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2 truncate">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-mono text-[11px] truncate">{hasRuntimeError}</span>
          </div>
          <button
            onClick={() => setHasRuntimeError(null)}
            className="text-[10px] text-rose-300 hover:text-white underline cursor-pointer shrink-0 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Frame Container */}
      <div className="flex-1 bg-[#07090e] p-2 flex items-center justify-center overflow-auto">
        <div
          style={{ width: dims.width, height: dims.height }}
          className={`transition-all duration-200 bg-white rounded-lg shadow-2xl overflow-hidden relative ${
            deviceMode !== 'desktop'
              ? 'border-4 border-slate-700 max-h-[96%]'
              : 'w-full h-full rounded-none'
          }`}
        >
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={compileProjectSource()}
            title="OmniCode Preview Sandbox"
            sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
