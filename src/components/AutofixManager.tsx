import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Smartphone, 
  Eye, 
  Wand2, 
  RefreshCw,
  Code2
} from 'lucide-react';
import { ResponsiveIssue, IssueSeverity } from '../types';

interface AutofixManagerProps {
  issues: ResponsiveIssue[];
  onApplyFix: (issueId: string) => void;
  onApplyAllFixes: () => void;
  onResetOriginal: () => void;
  onAnalyzeCustomCss: (css: string) => void;
  currentCss: string;
}

export const AutofixManager: React.FC<AutofixManagerProps> = ({
  issues,
  onApplyFix,
  onApplyAllFixes,
  onResetOriginal,
  onAnalyzeCustomCss,
  currentCss,
}) => {
  const [filter, setFilter] = useState<'all' | 'responsive' | 'cpu' | 'a11y'>('all');
  const [customInput, setCustomInput] = useState('');
  const [showCustomTester, setShowCustomTester] = useState(false);

  const filteredIssues = issues.filter(
    (issue) => filter === 'all' || issue.category === filter
  );

  const getSeverityBadge = (severity: IssueSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Critical Overflow
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Warning
          </span>
        );
      case 'cpu':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-500" />
            CPU Strain
          </span>
        );
      case 'a11y':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Eye className="w-3 h-3 text-blue-500" />
            A11y Touch/Focus
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Optimization
          </span>
        );
    }
  };

  const sampleProblematicCss = `.product-card {
  width: 680px; /* Causes mobile blowout */
  height: 100vh; /* iOS address bar jump */
  grid-template-columns: 1fr 1fr 1fr; /* squishes cards */
  font-size: 38px; /* rigid static font */
  outline: none; /* destroys keyboard a11y */
  backdrop-filter: blur(25px); /* heavy CPU/GPU cost */
  transition: width 0.4s ease; /* reflow thrashing */
}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Top Banner / Auto-Fix Action Bar */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Responsive & CPU Auto-Fix Engine
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Inspects your stylesheet for horizontal overflow bugs, mobile address bar jumpiness (100vh), rigid multi-column layouts, CPU-expensive backdrop blurs, and touch-target violations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onResetOriginal}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Sample</span>
            </button>

            {issues.length > 0 ? (
              <button
                id="btn-apply-all-autofixes"
                onClick={onApplyAllFixes}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <Wand2 className="w-4 h-4 text-slate-950" />
                <span>Auto-Fix All ({issues.length}) Issues</span>
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>All Screen Sizes & CPU Adaptations Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/80 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Issues ({issues.length})
          </button>
          <button
            onClick={() => setFilter('responsive')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'responsive'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            Responsive & Viewports ({issues.filter((i) => i.category === 'responsive').length})
          </button>
          <button
            onClick={() => setFilter('cpu')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'cpu'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            CPU Performance ({issues.filter((i) => i.category === 'cpu').length})
          </button>
          <button
            onClick={() => setFilter('a11y')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'a11y'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            Accessibility ({issues.filter((i) => i.category === 'a11y').length})
          </button>

          <button
            onClick={() => setShowCustomTester(!showCustomTester)}
            className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showCustomTester ? 'Hide CSS Auditor' : 'Audit Custom CSS'}</span>
          </button>
        </div>
      </div>

      {/* Custom CSS Auditor Playground */}
      {showCustomTester && (
        <div className="bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-900 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Diagnose & Auto-Fix Any Custom CSS Snippet
              </h3>
              <p className="text-xs text-slate-500">
                Paste any CSS rule below to detect responsive breakpoints, overflow flaws, and CPU cost.
              </p>
            </div>
            <button
              onClick={() => setCustomInput(sampleProblematicCss)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Load Broken CSS Demo
            </button>
          </div>

          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Paste your CSS here (e.g. width: 700px; height: 100vh; ...)"
            rows={5}
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-blue-500"
          />

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => onAnalyzeCustomCss(customInput)}
              disabled={!customInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
            >
              Analyze & Inject into Studio
            </button>
          </div>
        </div>
      )}

      {/* Issues List */}
      {filteredIssues.length > 0 ? (
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {getSeverityBadge(issue.severity)}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {issue.title}
                  </h3>
                </div>

                <button
                  id={`btn-autofix-${issue.id}`}
                  onClick={() => onApplyFix(issue.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Apply Auto-Fix</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {issue.description}
              </p>

              {/* Before & After Diff Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 font-mono text-xs">
                {/* Original Snippet */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-sans font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    <span>Problematic Anti-Pattern</span>
                    <span className="text-[10px] lowercase text-slate-400">breaks on mobile / low CPU</span>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-900/40 overflow-x-auto">
                    {issue.originalSnippet}
                  </pre>
                </div>

                {/* Auto-Fixed Snippet */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <span>Adaptive Auto-Fix</span>
                    <span className="text-[10px] lowercase text-slate-400">100% fluid & accessible</span>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 overflow-x-auto">
                    {issue.fixedSnippet}
                  </pre>
                </div>
              </div>

              {/* Impact Footer */}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Result:</span>
                <span>{issue.impact}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Zero Responsive or CPU Flaws Detected
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            The active CSS has passed all responsive checks: no fixed width blowouts, dynamic dvh units in place, fluid typography scaling active, and CPU paint loads balanced.
          </p>
        </div>
      )}
    </div>
  );
};
