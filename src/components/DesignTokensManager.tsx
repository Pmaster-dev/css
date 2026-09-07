import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sliders,
  Copy,
  Check,
  Sparkles,
  Layers,
  Box,
  Search,
  Filter,
  Palette,
  Ruler,
  Type,
  Hash,
  Code2,
  Plus,
  RotateCcw,
  Save,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Smartphone,
  Monitor,
  ExternalLink,
  Trash2,
  AlertCircle,
  Database,
  Cpu,
} from 'lucide-react';
import { CssComponentPreset, ExtractedCssVariable, CssVariableCategory } from '../types';
import {
  extractCssVariables,
  updateCssVariableInStylesheet,
  addCssVariableToStylesheet,
  generateRootSnippet,
  persistTokenOverrides,
  loadPersistedTokenOverrides,
  clearPersistedTokenOverrides,
} from '../utils/cssVariableExtractor';

interface DesignTokensManagerProps {
  activeCss?: string;
  onUpdateCss?: (newCss: string) => void;
  onInjectClampCss: (css: string) => void;
  selectedComponent?: CssComponentPreset;
  onNavigateToPreview?: () => void;
}

// Color conversion helper for native <input type="color">
function toHexColor(val: string): string {
  const clean = val.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean;
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  const rgbMatch = clean.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1], 10)).toString(16).padStart(2, '0');
    const g = Math.min(255, parseInt(rgbMatch[2], 10)).toString(16).padStart(2, '0');
    const b = Math.min(255, parseInt(rgbMatch[3], 10)).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  const named: Record<string, string> = {
    white: '#ffffff',
    black: '#000000',
    red: '#ef4444',
    blue: '#3b82f6',
    slate: '#64748b',
    transparent: '#000000',
  };
  return named[clean.toLowerCase()] || '#2563eb';
}

function parseNumericUnit(val: string): { num: number; unit: string } | null {
  const m = val.trim().match(/^(-?\d+(?:\.\d+)?)\s*(px|rem|em|%|vh|vw|dvh|svh|ch|pt)?$/);
  if (m) {
    return { num: parseFloat(m[1]), unit: m[2] || 'px' };
  }
  return null;
}

const QUICK_COLORS = [
  '#0f172a', '#1e293b', '#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ffffff'
];

export const DesignTokensManager: React.FC<DesignTokensManagerProps> = ({
  activeCss = '',
  onUpdateCss,
  onInjectClampCss,
  selectedComponent,
  onNavigateToPreview,
}) => {
  // Fluid Typography Calculator State (existing feature preserved)
  const [minFontRem, setMinFontRem] = useState(1.25);
  const [maxFontRem, setMaxFontRem] = useState(2.75);
  const [minViewportPx, setMinViewportPx] = useState(375);
  const [maxViewportPx, setMaxViewportPx] = useState(1280);

  // Spacing state
  const [minSpaceRem, setMinSpaceRem] = useState(1.0);
  const [maxSpaceRem, setMaxSpaceRem] = useState(3.5);

  const [copied, setCopied] = useState<string | null>(null);

  // --- Active Stylesheet CSS Variables & Live Override State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CssVariableCategory | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(6);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'mobile' | 'desktop'>('desktop');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [persistedCount, setPersistedCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cache baseline values so users can revert a modified token
  const baselineValuesRef = useRef<Map<string, string>>(new Map());

  // Extract variables with high performance memoization
  const extractedVariables = useMemo(() => {
    return extractCssVariables(activeCss);
  }, [activeCss]);

  // Track initial baselines once per unique set of variables
  useEffect(() => {
    if (baselineValuesRef.current.size === 0 && extractedVariables.length > 0) {
      extractedVariables.forEach((v) => {
        baselineValuesRef.current.set(v.name, v.value);
      });
    }
  }, [extractedVariables]);

  // Check persisted overrides count on mount
  useEffect(() => {
    const saved = loadPersistedTokenOverrides();
    setPersistedCount(Object.keys(saved).length);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: extractedVariables.length,
      color: 0,
      spacing: 0,
      typography: 0,
      number: 0,
      function: 0,
      other: 0,
    };
    extractedVariables.forEach((v) => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [extractedVariables]);

  // Filtered variables based on search and category
  const filteredVariables = useMemo(() => {
    return extractedVariables.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q)
      );
    });
  }, [extractedVariables, selectedCategory, searchQuery]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, pageSize]);

  // Paginated variables (load balancing rendering)
  const totalPages = Math.max(1, Math.ceil(filteredVariables.length / pageSize));
  const paginatedVariables = useMemo(() => {
    if (pageSize >= 999) return filteredVariables;
    const start = (currentPage - 1) * pageSize;
    return filteredVariables.slice(start, start + pageSize);
  }, [filteredVariables, currentPage, pageSize]);

  // Modify a variable value globally in the active stylesheet
  const handleModifyVariable = (varName: string, newValue: string) => {
    if (!onUpdateCss) return;
    const updatedCss = updateCssVariableInStylesheet(activeCss, varName, newValue);
    onUpdateCss(updatedCss);
  };

  // Revert variable to baseline
  const handleRevertVariable = (varName: string) => {
    const baseline = baselineValuesRef.current.get(varName);
    if (baseline && onUpdateCss) {
      handleModifyVariable(varName, baseline);
      triggerToast(`Reverted ${varName} to original stylesheet value`);
    }
  };

  // Persist current variables snapshot to LocalStorage
  const handleSaveSnapshot = () => {
    const overrides: Record<string, string> = {};
    extractedVariables.forEach((v) => {
      overrides[v.name] = v.value;
    });
    persistTokenOverrides(overrides);
    setPersistedCount(Object.keys(overrides).length);
    triggerToast(`Persisted ${Object.keys(overrides).length} design tokens to browser cache!`);
  };

  // Restore snapshot from LocalStorage
  const handleRestoreSnapshot = () => {
    const saved = loadPersistedTokenOverrides();
    const count = Object.keys(saved).length;
    if (count === 0) {
      triggerToast('No persisted design tokens found in browser cache.');
      return;
    }
    if (onUpdateCss) {
      let nextCss = activeCss;
      for (const [k, v] of Object.entries(saved)) {
        nextCss = updateCssVariableInStylesheet(nextCss, k, v);
      }
      onUpdateCss(nextCss);
      triggerToast(`Restored ${count} design tokens from browser cache!`);
    }
  };

  // Clear persisted cache
  const handleClearPersisted = () => {
    clearPersistedTokenOverrides();
    setPersistedCount(0);
    triggerToast('Cleared design tokens cache from localStorage.');
  };

  // Add new variable
  const handleAddNewVariable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarName.trim() || !newVarValue.trim() || !onUpdateCss) return;
    const cleanName = newVarName.startsWith('--') ? newVarName.trim() : `--${newVarName.trim()}`;
    const nextCss = addCssVariableToStylesheet(activeCss, cleanName, newVarValue.trim());
    onUpdateCss(nextCss);
    setNewVarName('');
    setNewVarValue('');
    setShowAddModal(false);
    triggerToast(`Added ${cleanName} to :root`);
  };

  // Initialize semantic variables if stylesheet has none
  const handleInitializeSemanticVariables = () => {
    if (!onUpdateCss) return;
    const starterTokens = `:root {
  --surface-base: #0f172a;
  --surface-card: #1e293b;
  --surface-border: #334155;
  --brand-primary: #2563eb;
  --brand-accent: #38bdf8;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --space-unit: 1rem;
  --radius-base: 8px;
}\n\n`;
    onUpdateCss(`${starterTokens}${activeCss}`);
    triggerToast('Injected semantic :root design tokens into active stylesheet!');
  };

  // Calculate fluid clamp formula: clamp(min, slope + intersection, max)
  const calculateClamp = (minRem: number, maxRem: number, minVwPx: number, maxVwPx: number) => {
    const minPx = minRem * 16;
    const maxPx = maxRem * 16;
    const slope = (maxPx - minPx) / (maxVwPx - minVwPx);
    const yIntersection = (-minVwPx * slope + minPx) / 16;
    const slopeVw = slope * 100;
    return `clamp(${minRem.toFixed(2)}rem, ${yIntersection.toFixed(3)}rem + ${slopeVw.toFixed(2)}vw, ${maxRem.toFixed(2)}rem)`;
  };

  const fluidHeadingClamp = calculateClamp(minFontRem, maxFontRem, minViewportPx, maxViewportPx);
  const fluidSpacingClamp = calculateClamp(minSpaceRem, maxSpaceRem, minViewportPx, maxViewportPx);

  const tokenSnippet = `:root {
  /* Fluid Scaled Typography */
  --font-fluid-heading: ${fluidHeadingClamp};
  --font-fluid-subhead: ${calculateClamp(minFontRem * 0.75, maxFontRem * 0.7, minViewportPx, maxViewportPx)};
  --space-fluid-container: ${fluidSpacingClamp};

  /* Safe Area Units */
  --sat: env(safe-area-inset-top, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
  --sar: env(safe-area-inset-right, 0px);

  /* Modern Semantic Surfaces */
  --surface-base: #0f172a;
  --surface-card: #1e293b;
  --surface-border: #334155;
  --brand-primary: #2563eb;
  --brand-accent: #38bdf8;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
}`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-blue-500/50 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-900/50 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Design Tokens Manager & Live Stylesheet Variable Engine
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Automatically extract, inspect, and modify all CSS custom properties defined in your active stylesheet. Live adjustments synchronize globally in real time with 0ms client-side latency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{extractedVariables.length} CSS Variables Detected</span>
            </span>
          </div>
        </div>
      </div>

      {/* PANEL 1: ACTIVE STYLESHEET CSS VARIABLES (LIVE TOKEN INSPECTOR & EDITOR) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Panel Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
                  <Palette className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Active Stylesheet Variables & Live Global Overrides
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Modifying these values instantly propagates across all CSS rules using <code className="text-blue-600 dark:text-blue-400">var(--name)</code>.
              </p>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                title="Add a new variable to :root"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variable</span>
              </button>

              <button
                onClick={() => handleCopy(generateRootSnippet(extractedVariables), 'all-root-tokens')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                title="Copy all active variables formatted as a clean :root CSS block"
              >
                {copied === 'all-root-tokens' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy :root CSS</span>
              </button>

              <button
                onClick={handleSaveSnapshot}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition-colors flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800"
                title="Persist token overrides to browser localStorage"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Snapshot</span>
              </button>

              {persistedCount > 0 && (
                <button
                  onClick={handleRestoreSnapshot}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 transition-colors flex items-center gap-1.5 border border-amber-200 dark:border-amber-800"
                  title="Restore saved snapshot tokens from browser localStorage"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Restore ({persistedCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter, Search & Load Balance Bar */}
          <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'All', icon: Layers, count: categoryCounts.all },
                  { id: 'color', label: 'Colors', icon: Palette, count: categoryCounts.color },
                  { id: 'spacing', label: 'Spacing', icon: Ruler, count: categoryCounts.spacing },
                  { id: 'typography', label: 'Typography', icon: Type, count: categoryCounts.typography },
                  { id: 'function', label: 'clamp/calc', icon: Code2, count: categoryCounts.function },
                  { id: 'number', label: 'Numbers', icon: Hash, count: categoryCounts.number },
                ] as const
              ).map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Page Size (Load Balance) */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter variable name or value..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Page size selector to avoid layout reflow on huge lists */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                title="Items per page"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={9999}>View all</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Body: Split Layout with Token Grid and Interactive Live Preview */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Token Modifier List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {extractedVariables.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <div className="mx-auto w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No CSS Custom Properties Extracted
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The active stylesheet does not define <code className="text-blue-500">--variables</code> yet. You can initialize a production set of semantic design tokens or add your own on the fly.
                </p>
                <button
                  onClick={handleInitializeSemanticVariables}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Initialize Semantic :root Tokens</span>
                </button>
              </div>
            ) : filteredVariables.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">No CSS variables match your search filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedVariables.map((token) => {
                  const isColor = token.category === 'color';
                  const isSpacing = token.category === 'spacing';
                  const isNumber = token.category === 'number';
                  const parsedNum = parseNumericUnit(token.value);
                  const isModifiedFromBaseline =
                    baselineValuesRef.current.has(token.name) &&
                    baselineValuesRef.current.get(token.name) !== token.value;

                  return (
                    <div
                      key={token.name}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      {/* Token Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 truncate select-all">
                              {token.name}
                            </span>
                            {isModifiedFromBaseline && (
                              <span
                                className="w-2 h-2 rounded-full bg-amber-500"
                                title="Value modified from initial stylesheet"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                              {token.scope}
                            </span>
                            {token.usageCount > 0 && (
                              <span>
                                • {token.usageCount} use{token.usageCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {isModifiedFromBaseline && (
                            <button
                              onClick={() => handleRevertVariable(token.name)}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-500 transition-colors"
                              title="Revert to original stylesheet value"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCopy(`${token.name}: ${token.value};`, token.name)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-500 transition-colors"
                            title="Copy declaration"
                          >
                            {copied === token.name ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Adaptive Live Editor Control */}
                      <div className="space-y-2">
                        {/* COLOR TYPE CONTROLS */}
                        {isColor ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {/* Color Swatch Picker */}
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner flex-shrink-0">
                                <input
                                  type="color"
                                  value={toHexColor(token.value)}
                                  onChange={(e) => handleModifyVariable(token.name, e.target.value)}
                                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                                  title="Pick color"
                                />
                              </div>

                              {/* Direct text input */}
                              <input
                                type="text"
                                value={token.value}
                                onChange={(e) => handleModifyVariable(token.name, e.target.value)}
                                className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                              />
                            </div>

                            {/* Quick Palette Chips */}
                            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                              {QUICK_COLORS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleModifyVariable(token.name, c)}
                                  className="w-4 h-4 rounded-full border border-black/20 hover:scale-125 transition-transform flex-shrink-0"
                                  style={{ backgroundColor: c }}
                                  title={`Set to ${c}`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : isSpacing && parsedNum ? (
                          /* SPACING / DIMENSION SLIDER CONTROLS */
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={parsedNum.unit === 'rem' ? 6 : parsedNum.unit === 'px' ? 96 : 100}
                                step={parsedNum.unit === 'rem' ? 0.125 : 1}
                                value={parsedNum.num}
                                onChange={(e) =>
                                  handleModifyVariable(
                                    token.name,
                                    `${e.target.value}${parsedNum.unit}`
                                  )
                                }
                                className="flex-1"
                              />
                              <input
                                type="text"
                                value={token.value}
                                onChange={(e) => handleModifyVariable(token.name, e.target.value)}
                                className="w-20 px-2 py-1 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-right focus:outline-hidden"
                              />
                            </div>
                          </div>
                        ) : isNumber && parsedNum ? (
                          /* UNITLESS NUMBER CONTROLS */
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={parsedNum.num <= 1 ? 1 : 100}
                              step={parsedNum.num <= 1 ? 0.05 : 1}
                              value={parsedNum.num}
                              onChange={(e) => handleModifyVariable(token.name, e.target.value)}
                              className="flex-1"
                            />
                            <input
                              type="text"
                              value={token.value}
                              onChange={(e) => handleModifyVariable(token.name, e.target.value)}
                              className="w-16 px-2 py-1 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-right focus:outline-hidden"
                            />
                          </div>
                        ) : (
                          /* GENERAL / FORMULA / FUNCTION TEXT INPUT */
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={token.value}
                              onChange={(e) => handleModifyVariable(token.name, e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls (Load Balancing Bar) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <span>
                  Showing {Math.min(filteredVariables.length, (currentPage - 1) * pageSize + 1)}–
                  {Math.min(filteredVariables.length, currentPage * pageSize)} of {filteredVariables.length} variables
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-semibold text-slate-800 dark:text-slate-200 px-1">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Component Preview (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span>Live Component Preview</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-slate-600 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setPreviewDeviceMode('desktop')}
                  className={`p-1 rounded ${previewDeviceMode === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-500' : ''}`}
                  title="Desktop preview width"
                >
                  <Monitor className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDeviceMode('mobile')}
                  className={`p-1 rounded ${previewDeviceMode === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-500' : ''}`}
                  title="Mobile preview width"
                >
                  <Smartphone className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Sandbox Viewport Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-inner flex flex-col">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="truncate">{selectedComponent?.name || 'Active Component'}</span>
                <span>{previewDeviceMode === 'mobile' ? '375px' : '100%'}</span>
              </div>

              {/* Scoped CSS Sandbox Container */}
              <div className="p-3 overflow-auto max-h-[380px] min-h-[260px] flex items-center justify-center bg-slate-900/60">
                <div
                  style={{
                    width: previewDeviceMode === 'mobile' ? '375px' : '100%',
                    transform: previewDeviceMode === 'mobile' ? 'scale(0.85)' : 'scale(1)',
                    transformOrigin: 'top center',
                    transition: 'all 0.2s ease',
                  }}
                  className="rounded-xl overflow-hidden shadow-md"
                >
                  <style>{`
                    .tokens-preview-sandbox-root {
                      font-family: system-ui, -apple-system, sans-serif;
                    }
                    ${activeCss}
                  `}</style>
                  <div
                    className="tokens-preview-sandbox-root"
                    dangerouslySetInnerHTML={{
                      __html: selectedComponent?.html || '<div class="p-6 text-white text-center">Preview Active</div>',
                    }}
                  />
                </div>
              </div>

              {/* Footer action to jump to Full Viewport Studio */}
              {onNavigateToPreview && (
                <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Live variables applied</span>
                  <button
                    onClick={onNavigateToPreview}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <span>Full Studio View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Persistence Status Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                  <span>Persistence & Offload</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  LocalStorage Synced
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Overrides are cached client-side without network requests. Low battery & CPU offload compliant.
              </p>
              {persistedCount > 0 && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">{persistedCount} tokens in cache</span>
                  <button
                    onClick={handleClearPersisted}
                    className="text-[10px] text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Cache</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW CSS VARIABLE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Add Global CSS Variable (:root)
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewVariable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Variable Name
                </label>
                <input
                  type="text"
                  placeholder="--brand-surface or brand-surface"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Value
                </label>
                <input
                  type="text"
                  placeholder="#3b82f6 or 1.5rem or clamp(...)"
                  value={newVarValue}
                  onChange={(e) => setNewVarValue(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                >
                  Declare Variable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PANEL 2: Mathematical Fluid Typography Interactive Generator (preserved) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Mathematical Fluid Typography Calculator
            </h3>
            <p className="text-xs text-slate-500">
              Smooth linear scaling between minimum mobile width and desktop display without breakpoint jumps.
            </p>
          </div>

          <button
            onClick={() =>
              onInjectClampCss(
                `\n/* Injected Fluid Typography */\nh1, .hero-title {\n  font-size: ${fluidHeadingClamp};\n}\n`
              )
            }
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inject Into Live CSS</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Min Font Size (Mobile)</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {minFontRem}rem ({minFontRem * 16}px)
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={minFontRem}
              onChange={(e) => setMinFontRem(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Max Font Size (Desktop)</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {maxFontRem}rem ({maxFontRem * 16}px)
              </span>
            </div>
            <input
              type="range"
              min="2.0"
              max="5.0"
              step="0.1"
              value={maxFontRem}
              onChange={(e) => setMaxFontRem(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Min Viewport Width</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{minViewportPx}px</span>
            </div>
            <input
              type="range"
              min="320"
              max="500"
              step="5"
              value={minViewportPx}
              onChange={(e) => setMinViewportPx(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Max Viewport Width</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{maxViewportPx}px</span>
            </div>
            <input
              type="range"
              min="960"
              max="1920"
              step="20"
              value={maxViewportPx}
              onChange={(e) => setMaxViewportPx(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>

        {/* Live Output Box */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-sans mr-2">Generated CSS:</span>
            <code className="text-emerald-400 font-bold">{`font-size: ${fluidHeadingClamp};`}</code>
          </div>
          <button
            onClick={() => handleCopy(`font-size: ${fluidHeadingClamp};`, 'clamp-font')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1"
          >
            {copied === 'clamp-font' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied === 'clamp-font' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* PANEL 3: Complete Root Tokens Pack (preserved) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pre-Configured Production Design Tokens (:root)
            </h3>
            <p className="text-xs text-slate-500">
              Complete CSS custom properties with safe area insets and semantic surfaces.
            </p>
          </div>
          <button
            onClick={() => handleCopy(tokenSnippet, 'tokens')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied === 'tokens' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied === 'tokens' ? 'Copied Tokens' : 'Copy Tokens'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto">
          {tokenSnippet}
        </pre>
      </div>
    </div>
  );
};
