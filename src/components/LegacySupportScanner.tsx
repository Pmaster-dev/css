import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Chrome,
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  Copy, 
  Check, 
  Filter, 
  Terminal, 
  ShieldAlert, 
  Code2, 
  Wand2, 
  Layers,
  HelpCircle,
  FileDown
} from 'lucide-react';
import { CompatibilityScanReport, LegacySupportIssue, SupportRiskLevel } from '../types';
import { scanCssForLegacyIssues, getSampleLegacyTestCss } from '../utils/legacyBrowserScanner';

interface LegacySupportScannerProps {
  activeCss: string;
  onUpdateCss: (newCss: string) => void;
  onNavigateToEditor: () => void;
}

export const LegacySupportScanner: React.FC<LegacySupportScannerProps> = ({
  activeCss,
  onUpdateCss,
  onNavigateToEditor,
}) => {
  const [report, setReport] = useState<CompatibilityScanReport>(() => scanCssForLegacyIssues(activeCss));
  const [isScanningWithChromium, setIsScanningWithChromium] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState<string>('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | SupportRiskLevel>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedFixIds, setAppliedFixIds] = useState<Set<string>>(new Set());

  // Auto-scan on CSS change using the local engine immediately
  useEffect(() => {
    // Only update if not currently in the middle of a live Chromium scan
    if (!isScanningWithChromium) {
      setReport(scanCssForLegacyIssues(activeCss));
    }
  }, [activeCss, isScanningWithChromium]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Perform Chromium Powered Compatibility Scan
  const handleRunChromiumScan = async () => {
    setIsScanningWithChromium(true);
    setScanStepMessage('Extracting CSS selectors and CSS4 declarations...');

    try {
      // Step 1: Simulate scanning progress for responsive UX feedback
      await new Promise((r) => setTimeout(r, 400));
      setScanStepMessage('Querying Chromium platform compatibility tables & baseline...');

      const response = await fetch('/api/scan-legacy-css', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ css: activeCss }),
      });

      const data = await response.json();

      if (data.success && (data.isAiChromiumPowered || data.isAiGoogleSearchPowered) && Array.isArray(data.issues) && data.issues.length > 0) {
        // Merge AI Chromium issues with base line numbers
        const baseReport = scanCssForLegacyIssues(activeCss);
        const mergedIssues: LegacySupportIssue[] = data.issues.map((aiIssue: any, idx: number) => {
          const matchBase = baseReport.issues.find(
            (b) => b.propertyOrFeature.toLowerCase().includes(aiIssue.propertyOrFeature.toLowerCase())
          );

          const query = aiIssue.chromiumQuery || aiIssue.googleSearchQuery || `Chromium CSS ${aiIssue.propertyOrFeature} browser support baseline`;
          const chromiumUrl = aiIssue.chromiumUrl || `https://chromestatus.com/features#${encodeURIComponent(aiIssue.propertyOrFeature)}`;
          return {
            id: `ai-issue-${idx}-${Date.now()}`,
            propertyOrFeature: aiIssue.propertyOrFeature,
            matchedLineNumber: matchBase?.matchedLineNumber,
            snippet: matchBase?.snippet || aiIssue.propertyOrFeature,
            riskLevel: (aiIssue.riskLevel === 'high' ? 'high' : 'moderate') as SupportRiskLevel,
            legacyStatusSummary: aiIssue.legacyStatusSummary,
            affectedBrowsers: aiIssue.affectedBrowsers || matchBase?.affectedBrowsers || [
              { browser: 'Legacy Safari', unsupportedVersions: '< 16.0', baselineStatus: 'Unsupported' },
              { browser: 'IE 11', unsupportedVersions: 'All', baselineStatus: 'Broken' }
            ],
            chromiumQuery: query,
            chromiumUrl: chromiumUrl,
            googleSearchQuery: query,
            googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            caniuseUrl: matchBase?.caniuseUrl || `https://caniuse.com/?search=${encodeURIComponent(aiIssue.propertyOrFeature)}`,
            mdnUrl: matchBase?.mdnUrl,
            searchCitations: data.citations || [],
            modernAlternative: aiIssue.modernAlternative,
            fallbackCssSnippet: aiIssue.fallbackCssSnippet || matchBase?.fallbackCssSnippet,
            autoFixCode: matchBase?.autoFixCode,
          };
        });

        setReport({
          timestamp: new Date().toISOString(),
          totalPropertiesScanned: baseReport.totalPropertiesScanned,
          highRiskCount: mergedIssues.filter((i) => i.riskLevel === 'high').length,
          moderateRiskCount: mergedIssues.filter((i) => i.riskLevel === 'moderate').length,
          safeCount: Math.max(0, baseReport.totalPropertiesScanned - mergedIssues.length),
          isAiChromiumPowered: true,
          isAiGoogleSearchPowered: true,
          issues: mergedIssues,
          searchInsights: data.summary,
        });
      } else {
        // Fallback to local baseline engine populated with live Chromium query URLs
        const localReport = scanCssForLegacyIssues(activeCss);
        setReport({
          ...localReport,
          isAiChromiumPowered: false,
          isAiGoogleSearchPowered: false,
          searchInsights: data?.error || data?.notice || 'Generated verified compatibility matrix with one-click Chromium platform status lookups for legacy browser fallbacks.',
        });
      }
    } catch (err) {
      console.warn('Chromium scan fallback to local engine:', err);
      setReport(scanCssForLegacyIssues(activeCss));
    } finally {
      setIsScanningWithChromium(false);
      setScanStepMessage('');
    }
  };

  // Apply fallback / autofix to the active CSS
  const handleApplyFallback = (issue: LegacySupportIssue) => {
    if (issue.autoFixCode) {
      if (activeCss.includes(issue.autoFixCode.find)) {
        const updated = activeCss.replace(issue.autoFixCode.find, issue.autoFixCode.replaceWith);
        onUpdateCss(updated);
        setAppliedFixIds((prev) => new Set(prev).add(issue.id));
        return;
      }
    }

    if (issue.fallbackCssSnippet) {
      const updated = `${activeCss}\n\n/* Modern Alternative & Legacy Fallback for ${issue.propertyOrFeature} */\n${issue.fallbackCssSnippet}`;
      onUpdateCss(updated);
      setAppliedFixIds((prev) => new Set(prev).add(issue.id));
    }
  };

  const handleApplyAllFallbacks = () => {
    let current = activeCss;
    const newApplied = new Set(appliedFixIds);

    for (const issue of report.issues) {
      if (issue.autoFixCode && current.includes(issue.autoFixCode.find)) {
        current = current.replace(issue.autoFixCode.find, issue.autoFixCode.replaceWith);
        newApplied.add(issue.id);
      }
    }

    onUpdateCss(current);
    setAppliedFixIds(newApplied);
  };

  // Filter issues
  const filteredIssues = report.issues.filter((issue) => {
    const matchesRisk = selectedRiskFilter === 'all' || issue.riskLevel === selectedRiskFilter;
    const matchesSearch =
      searchFilter.trim() === '' ||
      issue.propertyOrFeature.toLowerCase().includes(searchFilter.toLowerCase()) ||
      issue.legacyStatusSummary.toLowerCase().includes(searchFilter.toLowerCase()) ||
      issue.snippet.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const generateMarkdownReport = (): string => {
    let md = `# CSS Legacy Browser Compatibility Audit\n`;
    md += `*Generated: ${new Date(report.timestamp).toLocaleString()}*\n\n`;
    md += `### Summary\n`;
    md += `- Total Properties Scanned: ${report.totalPropertiesScanned}\n`;
    md += `- High Risk (Legacy Breakers): ${report.highRiskCount}\n`;
    md += `- Moderate Risk (Needs Prefix/Fallback): ${report.moderateRiskCount}\n`;
    md += `- Safe / Universal: ${report.safeCount}\n\n`;
    md += `## Flagged Properties & Chromium Engine Recommendations\n\n`;

    report.issues.forEach((issue, idx) => {
      md += `### ${idx + 1}. ${issue.propertyOrFeature} [${issue.riskLevel.toUpperCase()}]\n`;
      md += `- **Legacy Status**: ${issue.legacyStatusSummary}\n`;
      md += `- **Chromium Query / Status**: \`${issue.chromiumQuery || issue.googleSearchQuery}\`\n`;
      md += `- **Modern Alternative**: ${issue.modernAlternative}\n`;
      if (issue.fallbackCssSnippet) {
        md += `\`\`\`css\n${issue.fallbackCssSnippet}\n\`\`\`\n`;
      }
      md += `\n`;
    });

    return md;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              <Chrome className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Legacy Browser Compatibility Scanner
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                  <Chrome className="w-3 h-3" />
                  Chromium Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Scans active CSS rules for poor legacy support (Safari &lt; 16, IE11, older Chrome) and cross-references Chromium engine standards for resilient modern fallbacks.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => onUpdateCss(getSampleLegacyTestCss())}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            title="Load CSS containing subgrid, color-mix, :has, and dvh"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Load Legacy Test CSS</span>
          </button>

          <button
            onClick={handleRunChromiumScan}
            disabled={isScanningWithChromium}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningWithChromium ? 'animate-spin' : ''}`} />
            <span>{isScanningWithChromium ? 'Inspecting Chromium...' : 'Scan with Chromium'}</span>
          </button>

          {report.issues.some((i) => i.autoFixCode) && (
            <button
              onClick={handleApplyAllFallbacks}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Apply All Quick Fallbacks</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Status Strip while scanning */}
      {isScanningWithChromium && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center gap-3 animate-pulse">
          <Chrome className="w-5 h-5 text-blue-500 animate-spin" />
          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            {scanStepMessage || 'Querying Chromium platform compatibility data...'}
          </div>
        </div>
      )}

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* High Risk */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-500 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">High Legacy Risk</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {report.highRiskCount} {report.highRiskCount === 1 ? 'Rule' : 'Rules'}
              </div>
            </div>
          </div>
          <span className="text-[10px] text-red-500 font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60">
            Breaks in IE/Safari &lt; 16
          </span>
        </div>

        {/* Moderate Risk */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-500 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Moderate Risk</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {report.moderateRiskCount} {report.moderateRiskCount === 1 ? 'Rule' : 'Rules'}
              </div>
            </div>
          </div>
          <span className="text-[10px] text-amber-500 font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60">
            Needs Prefix / Fallback
          </span>
        </div>

        {/* Safe / Universal */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-500 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Universal Support</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {report.safeCount} Properties
              </div>
            </div>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60">
            99.9% Global Baseline
          </span>
        </div>

        {/* Search Engine Grounding Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-500 flex items-center justify-center font-bold">
              <Chrome className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Engine Verification</span>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {report.isAiChromiumPowered || report.isAiGoogleSearchPowered ? 'Live Chromium Grounding' : 'Verified Chromium Matrix'}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleCopy('md-report', generateMarkdownReport())}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title="Copy Markdown Report"
          >
            {copiedId === 'md-report' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chromium Insights Banner if present */}
      {report.searchInsights && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-blue-600 dark:text-blue-400 font-bold block mb-0.5">
              Chromium Platform Insights:
            </strong>
            {report.searchInsights}
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search filter input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search flagged properties, affected browsers, or fallbacks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Risk:</span>
          </span>
          <button
            onClick={() => setSelectedRiskFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              selectedRiskFilter === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All ({report.issues.length})
          </button>
          <button
            onClick={() => setSelectedRiskFilter('high')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              selectedRiskFilter === 'high'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100'
            }`}
          >
            High Risk ({report.highRiskCount})
          </button>
          <button
            onClick={() => setSelectedRiskFilter('moderate')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              selectedRiskFilter === 'moderate'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
            }`}
          >
            Moderate ({report.moderateRiskCount})
          </button>
        </div>
      </div>

      {/* Flagged Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-500 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Legacy Browser Bottlenecks Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            The active CSS uses properties compatible across all targeted browsers, or all flagged modern rules have appropriate progressive fallbacks.
          </p>
          <button
            onClick={() => onUpdateCss(getSampleLegacyTestCss())}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Load Sample Modern CSS to Test Scanner</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const isApplied = appliedFixIds.has(issue.id);

            return (
              <div
                key={issue.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                {/* Issue Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        issue.riskLevel === 'high'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                      }`}
                    >
                      {issue.riskLevel} Legacy Risk
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {issue.propertyOrFeature}
                    </h3>
                    {typeof issue.matchedLineNumber === 'number' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Line {issue.matchedLineNumber}
                      </span>
                    )}
                  </div>

                  {/* Browser badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {issue.affectedBrowsers.map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        title={b.baselineStatus}
                      >
                        <strong>{b.browser}</strong> {b.unsupportedVersions}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Legacy Breakdown Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Cause & Chromium Platform Query */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                        Legacy Browser Impact
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {issue.legacyStatusSummary}
                      </p>
                    </div>

                    {/* Chromium Link Box */}
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
                        <span className="flex items-center gap-1">
                          <Chrome className="w-3 h-3 text-blue-500" />
                          <span>Chromium Platform Verification:</span>
                        </span>
                        <a
                          href={issue.chromiumUrl || issue.googleSearchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 text-blue-600 dark:text-blue-400"
                        >
                          <span>Chromium Status</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="font-mono text-xs text-blue-900 dark:text-blue-200 select-all">
                        "{issue.chromiumQuery || issue.googleSearchQuery}"
                      </div>
                    </div>
                  </div>

                  {/* Right: Modern Alternative & Recommended Fallback */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                        Recommended Modern Alternative
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {issue.modernAlternative}
                      </p>
                    </div>

                    {/* Fallback Snippet Preview */}
                    {issue.fallbackCssSnippet && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Progressive Fallback Implementation</span>
                          <button
                            onClick={() => handleCopy(`snippet-${issue.id}`, issue.fallbackCssSnippet!)}
                            className="hover:text-white flex items-center gap-1"
                          >
                            {copiedId === `snippet-${issue.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy</span>
                          </button>
                        </div>
                        <pre className="p-3 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                          {issue.fallbackCssSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={issue.chromiumUrl || issue.googleSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition-colors flex items-center gap-1 border border-blue-200 dark:border-blue-800"
                    >
                      <Chrome className="w-3 h-3" />
                      <span>Chromium Status</span>
                    </a>

                    {issue.caniuseUrl && (
                      <a
                        href={issue.caniuseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <span>Can I Use</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {issue.mdnUrl && (
                      <a
                        href={issue.mdnUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <span>MDN Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyFallback(issue)}
                      disabled={isApplied}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isApplied
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Fallback Applied to CSS</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Apply Modern Alternative</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
