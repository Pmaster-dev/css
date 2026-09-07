import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Sliders, CheckCircle } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  css: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  css,
}) => {
  const [tab, setTab] = useState<'css' | 'tokens' | 'tailwind'>('css');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const res = downloadFile({
      content,
      filename,
      mimeType: 'text/css;charset=utf-8',
      onFallbackCopied: () => {
        showToast('Download blocked by iframe; copied to clipboard!');
      },
    });
    showToast(res.message);
  };

  const tokenContent = `:root {
  /* Fluid Scaled Font Tokens */
  --font-fluid-hero: clamp(2rem, 1.25rem + 3.2vw, 4rem);
  --font-fluid-body: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);

  /* Touch Safe Area Insets */
  --sat: env(safe-area-inset-top, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
  --sar: env(safe-area-inset-right, 0px);

  /* Semantic Theme Surfaces */
  --color-surface: #0f172a;
  --color-card: #1e293b;
  --color-brand: #2563eb;
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-border: #334155;
}`;

  const tailwindContent = `// tailwind.config.js / @theme (Tailwind v4)
@theme {
  --font-hero: clamp(2rem, 1.25rem + 3.2vw, 4rem);
  --font-body: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --spacing-safe-top: env(safe-area-inset-top);
  --spacing-safe-bottom: env(safe-area-inset-bottom);
}

/* Recommended Tailwind Classes:
 * Hero Title: text-[clamp(2rem,1.25rem+3.2vw,4rem)] font-extrabold break-words
 * Safe Container: min-h-dvh pt-[max(1.5rem,env(safe-area-inset-top))]
 * Auto Grid: grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))]
 * Touch Target: min-w-[44px] min-h-[44px]
 */`;

  const getActiveContent = () => {
    if (tab === 'tokens') return tokenContent;
    if (tab === 'tailwind') return tailwindContent;
    return css;
  };

  const getFilename = () => {
    if (tab === 'tokens') return 'tokens.css';
    if (tab === 'tailwind') return 'tailwind-theme.css';
    return 'adaptive-responsive-engine.css';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Export Production CSS & Config
              </h3>
              <p className="text-xs text-slate-500">
                Ready for deployment into Next.js, Vite, or pure HTML projects.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Format Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setTab('css')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'css'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Adaptive CSS Stylesheet
          </button>
          <button
            onClick={() => setTab('tokens')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'tokens'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            CSS Tokens (:root)
          </button>
          <button
            onClick={() => setTab('tailwind')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'tailwind'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tailwind CSS Mapping
          </button>
        </div>

        {/* Code Content Body */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {getActiveContent()}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Fluid, Hardware-Accelerated & WCAG 2.1 Compliant</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(getActiveContent())}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => handleDownload(getActiveContent(), getFilename())}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {getFilename()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
