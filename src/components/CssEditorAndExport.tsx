import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Code2, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Wand2, 
  Info, 
  HelpCircle,
  Play,
  Bug,
  Zap,
  ArrowRight,
  Globe,
  Chrome,
  Minimize2,
  Maximize2,
  FileCode,
  FileText,
  Percent,
  Archive,
  Sliders,
  X,
  RotateCcw
} from 'lucide-react';
import { lintCss, LintIssue, LintSeverity, LintCategory } from '../utils/cssLinter';
import { minifyCss, formatCss, MinifyOptions, MinifyResult } from '../utils/cssMinifier';
import { downloadFile, downloadViaServer, isRunningInIframe, isRunningInWebView } from '../utils/downloadHelper';

interface CssEditorAndExportProps {
  css: string;
  onChangeCss: (newCss: string) => void;
  onResetToComponentPreset: () => void;
  onNavigateToLegacyScanner?: () => void;
  isOpenExportModal?: boolean;
  onCloseExportModal?: () => void;
}

const DEMO_ERRORS_CSS = `/* Demo Stylesheet with Syntax Errors, @import Waterfall & Quality Bottlenecks */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap'); /* Architecture Warning: Cascading @import blocks parallel downloads */

.hero-container {
  dispaly: flex; /* Syntax Error: Misspelled property */
  flex-direction: column;
  width: 780px; /* Responsive Warning: Rigid width overflows on mobile */
  height: 100vh; /* Quality Suggestion: 100vh jumps on mobile URL bar, use 100dvh */
  pading: 24px; /* Syntax Error: Misspelled 'padding' */
  margin-left: auto; /* Quality Suggestion: Consider logical margin-inline */
  margin-right: auto;
  outline: none; /* A11y Error: outline:none destroys keyboard navigation focus */
  transition: width 0.3s ease, margin 0.2s ease; /* Performance: Layout thrashing, use transform */
  background: #0f172a
  border-radius: 16px; /* Missing semicolon above! */
}

.cta-button {
  colr: #ffffff; /* Syntax Error: Misspelled 'color' */
  padding: 12 24px; /* Syntax Error: Missing unit on non-zero length '12' */
  font-size: 1.25rem !important; /* Quality: Avoid !important overuse */
  -webkit-border-radius: 9999px; /* Quality: Obsolete vendor prefix */
`;

export const CssEditorAndExport: React.FC<CssEditorAndExportProps> = ({
  css,
  onChangeCss,
  onResetToComponentPreset,
  onNavigateToLegacyScanner,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | LintSeverity>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | LintCategory>('all');
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [showInlineIndicators, setShowInlineIndicators] = useState(true);
  const [isLinterDrawerExpanded, setIsLinterDrawerExpanded] = useState(true);
  const [currentIssueIndex, setCurrentIssueIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Minification suite state & options
  const [isMinifySuiteOpen, setIsMinifySuiteOpen] = useState(false);
  const [showMinifiedPreview, setShowMinifiedPreview] = useState(false);
  const [copiedMinified, setCopiedMinified] = useState(false);
  const [preMinifiedBackup, setPreMinifiedBackup] = useState<string | null>(null);
  const [minifyOptions, setMinifyOptions] = useState<MinifyOptions>({
    stripComments: true,
    shortenZeroUnits: true,
    removeTrailingSemicolons: true,
    preserveCalcSpacing: true,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Run real-time CSS linter
  const lintResult = useMemo(() => {
    return lintCss(css);
  }, [css]);

  // Run regex-based CSS minifier
  const minifyResult = useMemo(() => {
    return minifyCss(css, minifyOptions);
  }, [css, minifyOptions]);

  // Detect if current stylesheet is already minified
  const isCurrentlyMinified = useMemo(() => {
    const trimmed = css.trim();
    if (!trimmed) return false;
    const l = trimmed.split('\n').length;
    return l <= 3 && trimmed.length > 80;
  }, [css]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const { issues, errorCount, warningCount, suggestionCount, healthScore } = lintResult;

  // Map of line number to issues on that line for quick gutter lookup
  const lineIssuesMap = useMemo(() => {
    const map = new Map<number, LintIssue[]>();
    for (const issue of issues) {
      const existing = map.get(issue.line) || [];
      existing.push(issue);
      map.set(issue.line, existing);
    }
    return map;
  }, [issues]);

  // Filtered issues list for the diagnostics tab
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
      const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
      return matchesSeverity && matchesCategory;
    });
  }, [issues, selectedSeverity, selectedCategory]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('CSS copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const res = downloadFile({
      content: css,
      filename: 'advanced-adaptive-styles.css',
      mimeType: 'text/css;charset=utf-8',
      onFallbackCopied: () => {
        showToast('Direct download blocked by iframe sandbox; CSS copied to clipboard instead!');
      },
    });
    showToast(res.message);
  };

  const handleDownloadMinified = () => {
    const res = downloadFile({
      content: minifyResult.minifiedCss,
      filename: 'advanced-adaptive-styles.min.css',
      mimeType: 'text/css;charset=utf-8',
      onFallbackCopied: () => {
        showToast('Direct download blocked by iframe sandbox; Minified CSS copied to clipboard instead!');
      },
    });
    showToast(res.message);
  };

  const handleServerDownload = async (isMinified = false) => {
    const filename = isMinified ? 'advanced-adaptive-styles.min.css' : 'advanced-adaptive-styles.css';
    const content = isMinified ? minifyResult.minifiedCss : css;
    showToast(`Streaming ${filename} via server attachment...`);
    const success = await downloadViaServer(filename, content, 'text/css;charset=utf-8');
    if (success) {
      showToast(`Server delivered attachment: ${filename}`);
    } else {
      showToast('Server stream completed; verified fallback code copied.');
    }
  };

  const handleCopyMinified = () => {
    navigator.clipboard.writeText(minifyResult.minifiedCss);
    setCopiedMinified(true);
    showToast('Minified production CSS copied to clipboard!');
    setTimeout(() => setCopiedMinified(false), 2000);
  };

  const handleApplyMinifyToEditor = () => {
    setPreMinifiedBackup(css);
    onChangeCss(minifyResult.minifiedCss);
    showToast(`Applied minification! Saved ${formatBytes(minifyResult.savedBytes)} (${minifyResult.savingsPercentage}% reduction).`);
  };

  const handleRestoreFormatted = () => {
    if (preMinifiedBackup) {
      onChangeCss(preMinifiedBackup);
      setPreMinifiedBackup(null);
      showToast('Restored pre-minified formatted CSS.');
    } else {
      const formatted = formatCss(css);
      onChangeCss(formatted);
      showToast('Beautified and formatted CSS indentation.');
    }
  };

  // Apply single quick fix
  const handleApplyQuickFix = (issue: LintIssue) => {
    if (issue.quickFix) {
      const updatedCss = issue.quickFix.apply(css);
      onChangeCss(updatedCss);
      showToast(`Applied fix: ${issue.quickFix.label}`);
      if (activeIssueId === issue.id) {
        setActiveIssueId(null);
      }
    }
  };

  // Apply all auto-fixable issues at once
  const handleFixAllFixable = () => {
    let updated = css;
    let fixCount = 0;
    // Iterate over issues with quickFix
    for (const issue of issues) {
      if (issue.quickFix) {
        try {
          updated = issue.quickFix.apply(updated);
          fixCount++;
        } catch {
          // ignore failures on compound edits
        }
      }
    }
    if (fixCount > 0) {
      onChangeCss(updated);
      showToast(`Successfully auto-fixed ${fixCount} issues!`);
    } else {
      showToast('No auto-fixable issues detected.');
    }
  };

  // Load demo CSS with syntax errors and quality issues
  const handleLoadDemoErrors = () => {
    onChangeCss(DEMO_ERRORS_CSS);
    showToast('Loaded demo stylesheet with syntax errors & bottlenecks.');
  };

  // Navigate between issues (Next / Prev)
  const handleJumpToIssue = (index: number) => {
    if (issues.length === 0) return;
    const targetIdx = (index + issues.length) % issues.length;
    setCurrentIssueIndex(targetIdx);
    const targetIssue = issues[targetIdx];
    setActiveIssueId(targetIssue.id);

    // Scroll textarea to the corresponding line
    if (textareaRef.current) {
      const lines = css.split('\n');
      const targetLine = targetIssue.line;
      let charCount = 0;
      for (let i = 0; i < targetLine - 1 && i < lines.length; i++) {
        charCount += lines[i].length + 1;
      }
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(charCount, charCount + (lines[targetLine - 1]?.length || 0));
      // Scroll proportionally
      const lineHeight = 24; // 24px per line
      textareaRef.current.scrollTop = Math.max(0, (targetLine - 5) * lineHeight);
    }
  };

  const lineCount = css.split('\n').length;
  const lines = css.split('\n');

  // Currently active issue details (if selected)
  const activeIssue = useMemo(() => {
    if (!activeIssueId) return null;
    return issues.find((i) => i.id === activeIssueId) || null;
  }, [issues, activeIssueId]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700/50">
          <Zap className="w-4 h-4 text-blue-400 dark:text-blue-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editor Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Live CSS Code Inspector & Real-Time Linter
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Active Linter
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Instant AST & syntax checking, bracket balancing, typo detection, and WCAG/CPU quality recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadDemoErrors}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1.5"
            title="Load sample CSS with common syntax errors and performance bottlenecks to test the linter"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Test Demo Errors</span>
          </button>

          {onNavigateToLegacyScanner && (
            <button
              onClick={onNavigateToLegacyScanner}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5"
              title="Scan active CSS with Chromium engine for legacy browser support"
            >
              <Chrome className="w-3.5 h-3.5" />
              <span>Chromium Compatibility</span>
            </button>
          )}

          {/* Minify CSS Suite Trigger */}
          <button
            onClick={() => setIsMinifySuiteOpen(!isMinifySuiteOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
              isMinifySuiteOpen
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border-purple-200 dark:border-purple-800'
            }`}
            title="Open regex-based CSS compressor suite to minify production code"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify CSS</span>
            {minifyResult.savingsPercentage > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isMinifySuiteOpen
                  ? 'bg-purple-700 text-purple-100'
                  : 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
              }`}>
                -{minifyResult.savingsPercentage}%
              </span>
            )}
          </button>

          {(preMinifiedBackup || isCurrentlyMinified) && (
            <button
              onClick={handleRestoreFormatted}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
              title="Format and beautify CSS with clean 2-space indentation"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Format CSS</span>
            </button>
          )}

          <button
            onClick={onResetToComponentPreset}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            title="Reset code back to archetype default"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset CSS</span>
          </button>

          <button
            onClick={() => handleCopy(css)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy All'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .css</span>
          </button>

          <button
            onClick={handleDownloadMinified}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            title="Download production minified .min.css file"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>.min.css</span>
          </button>
        </div>
      </div>

      {/* Minify CSS & Production Compression Suite Panel */}
      {isMinifySuiteOpen && (
        <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-5 shadow-lg relative space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Minimize2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Production CSS Minifier
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Regex Engine
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Lossless
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Multi-pass regex compressor strips comments, collapses whitespace, shortens zero units, and drops redundant punctuation while safely preserving strings, URLs, and calc() arithmetic.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMinifySuiteOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close Minify Suite"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Compression Metrics Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Original Size</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatBytes(minifyResult.originalBytes)}
              </div>
              <span className="text-[10px] text-slate-500">{minifyResult.originalLines} lines</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
              <span className="text-[11px] text-purple-600 dark:text-purple-400 uppercase font-semibold">Minified Size</span>
              <div className="text-sm font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                {formatBytes(minifyResult.minifiedBytes)}
              </div>
              <span className="text-[10px] text-purple-500 dark:text-purple-400">
                {minifyResult.minifiedLines} {minifyResult.minifiedLines === 1 ? 'line' : 'lines'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Net Savings</span>
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                -{formatBytes(minifyResult.savedBytes)}
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {minifyResult.savingsPercentage}% reduction
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Compression Factor</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {minifyResult.reductionRatio}
              </div>
              <span className="text-[10px] text-slate-500">production density</span>
            </div>
          </div>

          {/* Compressor Rules Configuration */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-purple-500" />
              <span>Regex Compressor Passes & Optimization Rules:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={minifyOptions.stripComments}
                  onChange={(e) => setMinifyOptions({ ...minifyOptions, stripComments: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Strip comments (/* */)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={minifyOptions.shortenZeroUnits}
                  onChange={(e) => setMinifyOptions({ ...minifyOptions, shortenZeroUnits: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Shorten zero units (0px → 0)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={minifyOptions.removeTrailingSemicolons}
                  onChange={(e) => setMinifyOptions({ ...minifyOptions, removeTrailingSemicolons: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Drop trailing semicolons (;)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={minifyOptions.preserveCalcSpacing}
                  onChange={(e) => setMinifyOptions({ ...minifyOptions, preserveCalcSpacing: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Preserve calc() +/- spacing</span>
              </label>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleApplyMinifyToEditor}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                title="Replace editor content with regex-minified CSS"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply Minified CSS to Editor</span>
              </button>

              <button
                onClick={handleCopyMinified}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                title="Copy minified CSS directly to clipboard"
              >
                {copiedMinified ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMinified ? 'Copied Minified!' : 'Copy Minified'}</span>
              </button>

              <button
                onClick={handleDownloadMinified}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                title="Download .min.css production file"
              >
                <Download className="w-3.5 h-3.5 text-purple-500" />
                <span>Download .min.css</span>
              </button>

              {(preMinifiedBackup || isCurrentlyMinified) && (
                <button
                  onClick={handleRestoreFormatted}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
                  title="Format or restore unminified CSS"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Formatted</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowMinifiedPreview(!showMinifiedPreview)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showMinifiedPreview ? 'Hide Preview' : 'Preview Output'}</span>
              {showMinifiedPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Minified Code Preview */}
          {showMinifiedPreview && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">Output: advanced-adaptive-styles.min.css</span>
                <span>{minifyResult.minifiedBytes} bytes ({minifyResult.minifiedLines} line)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-purple-200 max-h-40 overflow-y-auto break-all select-all leading-relaxed">
                {minifyResult.minifiedCss || '/* Empty CSS */'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real-Time Linter Health & Status Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Health Score Meter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-xs ${
                  healthScore >= 90
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : healthScore >= 70
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                }`}
              >
                {healthScore}%
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    CSS Quality & Health Score
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({healthScore >= 90 ? 'Clean Code' : healthScore >= 70 ? 'Moderate' : 'Needs Repair'})
                  </span>
                </div>
                <div className="w-48 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      healthScore >= 90 ? 'bg-emerald-500' : healthScore >= 70 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Issue Severity Summary Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedSeverity(selectedSeverity === 'error' ? 'all' : 'error')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedSeverity === 'error'
                    ? 'bg-red-600 text-white shadow-xs'
                    : errorCount > 0
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorCount} Errors</span>
              </button>

              <button
                onClick={() => setSelectedSeverity(selectedSeverity === 'warning' ? 'all' : 'warning')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedSeverity === 'warning'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : warningCount > 0
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{warningCount} Warnings</span>
              </button>

              <button
                onClick={() => setSelectedSeverity(selectedSeverity === 'suggestion' ? 'all' : 'suggestion')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedSeverity === 'suggestion'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : suggestionCount > 0
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{suggestionCount} Suggestions</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation & Auto-Fix All Action */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {issues.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleJumpToIssue(currentIssueIndex - 1)}
                  className="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                  title="Jump to previous issue"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono font-medium px-2 text-slate-600 dark:text-slate-300">
                  {issues.length === 0 ? 0 : currentIssueIndex + 1}/{issues.length}
                </span>
                <button
                  onClick={() => handleJumpToIssue(currentIssueIndex + 1)}
                  className="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                  title="Jump to next issue"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {issues.some((i) => i.quickFix) && (
              <button
                onClick={handleFixAllFixable}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Quick-Fix All Suggestions</span>
              </button>
            )}

            <button
              onClick={() => setShowInlineIndicators(!showInlineIndicators)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showInlineIndicators
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
              title="Toggle error and suggestion markers in the editor"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inline Markers:</span>
              <span>{showInlineIndicators ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Editor Top Bar */}
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-slate-300 font-sans font-semibold">stylesheet.css</span>
            {isCurrentlyMinified && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Minimize2 className="w-3 h-3" />
                Minified Production Build
              </span>
            )}
            {issues.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                {issues.length} {issues.length === 1 ? 'issue' : 'issues'} flagged
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'} ({formatBytes(minifyResult.originalBytes)})</span>
            <span>•</span>
            {isCurrentlyMinified ? (
              <button
                onClick={handleRestoreFormatted}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans text-xs underline underline-offset-2"
                title="Format CSS with clean 2-space indentation"
              >
                <FileCode className="w-3.5 h-3.5" />
                Format
              </button>
            ) : (
              <button
                onClick={handleApplyMinifyToEditor}
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-sans text-xs underline underline-offset-2"
                title="Minify active CSS with regex compressor"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                Minify ({minifyResult.savingsPercentage}% off)
              </button>
            )}
            <span>•</span>
            <span>Real-Time Parser: Active</span>
          </div>
        </div>

        {/* Editor Body with Gutter & Textarea */}
        <div className="flex relative">
          {/* Gutter with Line Numbers and Linter Markers */}
          <div className="py-4 pl-3 pr-2 select-none text-right font-mono text-xs bg-slate-950/95 border-r border-slate-800/80 min-w-[64px]">
            {lines.map((_, i) => {
              const lineNum = i + 1;
              const lineIssues = lineIssuesMap.get(lineNum);
              const hasError = lineIssues?.some((iss) => iss.severity === 'error');
              const hasWarning = lineIssues?.some((iss) => iss.severity === 'warning');
              const hasSuggestion = lineIssues?.some((iss) => iss.severity === 'suggestion');

              return (
                <div
                  key={lineNum}
                  onClick={() => {
                    if (lineIssues && lineIssues.length > 0) {
                      setActiveIssueId(lineIssues[0].id);
                    }
                  }}
                  className={`leading-6 flex items-center justify-end gap-1.5 cursor-pointer group ${
                    lineIssues ? 'font-bold' : 'text-slate-600'
                  }`}
                >
                  {/* Issue Marker Icon */}
                  {showInlineIndicators && lineIssues && (
                    <span
                      title={`${lineIssues.length} issue(s): ${lineIssues.map((iss) => iss.message).join(' | ')}`}
                      className="inline-flex items-center justify-center transition-transform group-hover:scale-125"
                    >
                      {hasError ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs shadow-red-500/50" />
                      ) : hasWarning ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-xs shadow-blue-400/50" />
                      )}
                    </span>
                  )}

                  <span
                    className={`${
                      hasError
                        ? 'text-red-400 font-bold'
                        : hasWarning
                        ? 'text-amber-400 font-bold'
                        : hasSuggestion
                        ? 'text-blue-400'
                        : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  >
                    {lineNum}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Code Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={css}
              onChange={(e) => onChangeCss(e.target.value)}
              spellCheck={false}
              className="w-full h-[540px] p-4 font-mono text-xs text-blue-100 bg-transparent resize-none leading-6 outline-none focus:ring-0 selection:bg-blue-800/60 font-medium"
              placeholder="/* Paste or write CSS here to inspect and lint in real time */"
            />
          </div>
        </div>

        {/* Active Issue Callout Banner inside Editor (if user clicked an issue or line) */}
        {activeIssue && (
          <div className="bg-slate-900 border-t border-slate-800 p-4 animate-fadeIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  activeIssue.severity === 'error'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : activeIssue.severity === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {activeIssue.severity === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : activeIssue.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Lightbulb className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-white">Line {activeIssue.line}:</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      activeIssue.severity === 'error'
                        ? 'bg-red-500/20 text-red-400'
                        : activeIssue.severity === 'warning'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {activeIssue.severity}
                  </span>
                  {activeIssue.label && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      {activeIssue.label}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">{activeIssue.rule}</span>
                </div>
                <p className="text-xs text-slate-200 mt-1">{activeIssue.message}</p>

                {activeIssue.doNot && (
                  <p className="text-[11px] text-red-300 mt-1 bg-red-950/40 border border-red-800/40 rounded-lg px-2 py-1 flex items-start gap-1">
                    <span className="font-bold text-red-400 uppercase text-[10px] shrink-0">Do Not:</span>
                    <span>{activeIssue.doNot}</span>
                  </p>
                )}
                {activeIssue.warn && (
                  <p className="text-[11px] text-amber-300 mt-1 bg-amber-950/40 border border-amber-800/40 rounded-lg px-2 py-1 flex items-start gap-1">
                    <span className="font-bold text-amber-400 uppercase text-[10px] shrink-0">Warn:</span>
                    <span>{activeIssue.warn}</span>
                  </p>
                )}
                {activeIssue.tip && (
                  <p className="text-[11px] text-emerald-300 mt-1 bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-2 py-1 flex items-start gap-1">
                    <span className="font-bold text-emerald-400 uppercase text-[10px] shrink-0">Tip:</span>
                    <span>{activeIssue.tip}</span>
                  </p>
                )}
                {activeIssue.notes && (
                  <p className="text-[11px] text-blue-300 mt-1 bg-blue-950/40 border border-blue-800/40 rounded-lg px-2 py-1 flex items-start gap-1">
                    <span className="font-bold text-blue-400 uppercase text-[10px] shrink-0">Notes:</span>
                    <span>{activeIssue.notes}</span>
                  </p>
                )}

                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span className="text-blue-400 font-semibold">Suggestion:</span>
                  <span>{activeIssue.suggestion}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {activeIssue.quickFix && (
                <button
                  onClick={() => handleApplyQuickFix(activeIssue)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{activeIssue.quickFix.label}</span>
                </button>
              )}
              <button
                onClick={() => setActiveIssueId(null)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Comprehensive Linter Diagnostics & Suggestions Drawer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {/* Drawer Header */}
        <div
          onClick={() => setIsLinterDrawerExpanded(!isLinterDrawerExpanded)}
          className="px-5 py-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-Time Linter Diagnostics & Improvement Suggestions
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {issues.length} {issues.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Categorized issues with one-click code refactoring and best-practice guidance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLinterDrawerExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        {/* Drawer Content */}
        {isLinterDrawerExpanded && (
          <div className="p-5 space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Category:</span>
              </div>

              {(['all', 'syntax', 'responsive', 'performance', 'a11y', 'modern-css'] as const).map((cat) => {
                const count = cat === 'all' ? issues.length : issues.filter((i) => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat === 'all' ? 'All Categories' : cat}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* List of Detected Issues */}
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No issues found in this category!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Your CSS syntax conforms to standard CSS specifications, responsive guidelines, and accessibility standards.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredIssues.map((issue) => {
                  const isSelected = activeIssueId === issue.id;

                  return (
                    <div
                      key={issue.id}
                      onClick={() => {
                        setActiveIssueId(issue.id);
                        handleJumpToIssue(issues.findIndex((i) => i.id === issue.id));
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 shadow-xs'
                          : issue.severity === 'error'
                          ? 'border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10 hover:border-red-300'
                          : issue.severity === 'warning'
                          ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-300'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                issue.severity === 'error'
                                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                  : issue.severity === 'warning'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                  : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {issue.severity}
                            </span>
                            {issue.label && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                                {issue.label}
                              </span>
                            )}
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                              Line {issue.line}
                            </span>
                          </div>

                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {issue.category}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {issue.message}
                        </h4>

                        {/* Detailed Notes, Do Not, Warn, Tip */}
                        {issue.doNot && (
                          <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-[11px] text-red-800 dark:text-red-300 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold uppercase text-[10px]">Do Not: </span>
                              <span>{issue.doNot}</span>
                            </div>
                          </div>
                        )}

                        {issue.warn && (
                          <div className="mt-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold uppercase text-[10px]">Warn: </span>
                              <span>{issue.warn}</span>
                            </div>
                          </div>
                        )}

                        {issue.tip && (
                          <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold uppercase text-[10px]">Tip: </span>
                              <span>{issue.tip}</span>
                            </div>
                          </div>
                        )}

                        {issue.notes && (
                          <div className="mt-1.5 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300 flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold uppercase text-[10px]">Notes: </span>
                              <span>{issue.notes}</span>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Fix:</span>{' '}
                          {issue.suggestion}
                        </p>
                      </div>

                      {/* Card Action footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400">
                          {issue.rule}
                        </span>

                        {issue.quickFix ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyQuickFix(issue);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>Quick Fix</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Manual edit required
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
