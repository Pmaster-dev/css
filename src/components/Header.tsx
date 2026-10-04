import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Cpu, 
  Sparkles, 
  Sun, 
  Moon, 
  Contrast, 
  Eye, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Code2,
  BookOpen,
  Globe,
  Chrome,
  Sliders,
  Layers
} from 'lucide-react';
import { ThemeMode, CpuMode, DevicePreset } from '../types';
import { DEVICE_PRESETS } from '../data/devicePresets';

interface HeaderProps {
  currentDevice: DevicePreset;
  onSelectDevice: (device: DevicePreset) => void;
  themeMode: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  cpuMode: CpuMode;
  onSelectCpuMode: (mode: CpuMode) => void;
  cpuScore: number;
  issueCount: number;
  lintIssueCount?: number;
  lintErrorCount?: number;
  legacyRiskCount?: number;
  mockToProdRiskCount?: number;
  onOpenExport: () => void;
  onRunAutofixAll: () => void;
  activeTab: 'preview' | 'autofix' | 'cpu' | 'tokens' | 'a11y' | 'editor' | 'registry' | 'legacy' | 'mocktoprod';
  onSelectTab: (tab: 'preview' | 'autofix' | 'cpu' | 'tokens' | 'a11y' | 'editor' | 'registry' | 'legacy' | 'mocktoprod') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDevice,
  onSelectDevice,
  themeMode,
  onToggleTheme,
  cpuMode,
  onSelectCpuMode,
  cpuScore,
  issueCount,
  lintIssueCount,
  lintErrorCount,
  legacyRiskCount,
  mockToProdRiskCount,
  onOpenExport,
  onRunAutofixAll,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            CSS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Advanced CSS Studio
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Responsive & CPU Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Auto-fix viewport overflow • CPU load throttling • WCAG AA/AAA audit
            </p>
          </div>
        </div>

        {/* Quick Viewport Device Pill Switcher */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
          {DEVICE_PRESETS.slice(0, 5).map((preset) => {
            const isSelected = currentDevice.id === preset.id;
            return (
              <button
                key={preset.id}
                id={`btn-device-${preset.id}`}
                onClick={() => onSelectDevice(preset)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={`${preset.name} (${preset.width}×${preset.height}px)`}
              >
                {preset.type === 'mobile' || preset.type === 'fold' ? (
                  <Smartphone className="w-3.5 h-3.5" />
                ) : preset.type === 'tablet' ? (
                  <Tablet className="w-3.5 h-3.5" />
                ) : (
                  <Laptop className="w-3.5 h-3.5" />
                )}
                <span>{preset.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-70">({preset.width})</span>
              </button>
            );
          })}
        </div>

        {/* Actions & Global Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Auto-fix Button if issues exist */}
          {issueCount > 0 ? (
            <button
              id="btn-quick-autofix"
              onClick={onRunAutofixAll}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-colors"
              title="Apply responsive auto-fixes"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Fix ({issueCount})</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Optimized</span>
            </div>
          )}

          {/* CPU Mode Indicator Pill */}
          <div className="relative group">
            <button
              id="btn-cpu-mode-selector"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                cpuMode === 'low-power'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              title="CPU Adaptation Mode"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CPU:</span>
              <span className="font-semibold uppercase text-[11px]">{cpuMode}</span>
              <span className={`w-2 h-2 rounded-full ${cpuScore > 75 ? 'bg-emerald-500' : cpuScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
            </button>
            {/* Dropdown for CPU mode */}
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-1 hidden group-hover:block z-50">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                CPU Adapt Mode
              </div>
              <button
                onClick={() => onSelectCpuMode('auto')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  cpuMode === 'auto' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <span>Auto Adapt</span>
                <span className="text-[10px] text-slate-400">Balanced</span>
              </button>
              <button
                onClick={() => onSelectCpuMode('low-power')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  cpuMode === 'low-power' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <span>Battery Saver</span>
                <span className="text-[10px] text-emerald-500">Low CPU</span>
              </button>
              <button
                onClick={() => onSelectCpuMode('high')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                  cpuMode === 'high' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <span>Max Quality</span>
                <span className="text-[10px] text-amber-500">Heavy</span>
              </button>
            </div>
          </div>

          {/* Theme Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              id="theme-btn-light"
              onClick={() => onToggleTheme('light')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                themeMode === 'light' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              id="theme-btn-dark"
              onClick={() => onToggleTheme('dark')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                themeMode === 'dark' ? 'bg-slate-700 text-blue-300 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              id="theme-btn-oled"
              onClick={() => onToggleTheme('oled')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                themeMode === 'oled' ? 'bg-black text-purple-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="OLED Pure Black"
            >
              <Contrast className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export CSS Button */}
          <button
            id="btn-header-export"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSS</span>
          </button>
        </div>
      </div>

      {/* Primary Studio Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-slate-800/80">
        <button
          id="tab-preview"
          onClick={() => onSelectTab('preview')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Multi-Screen Canvas</span>
        </button>

        <button
          id="tab-autofix"
          onClick={() => onSelectTab('autofix')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'autofix'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Responsive Auto-Fix</span>
          {issueCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {issueCount}
            </span>
          )}
        </button>

        <button
          id="tab-cpu"
          onClick={() => onSelectTab('cpu')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'cpu'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>CPU & Render Manager</span>
          <span className="text-[10px] text-slate-400">({cpuScore}/100)</span>
        </button>

        <button
          id="tab-a11y"
          onClick={() => onSelectTab('a11y')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'a11y'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Accessibility & WCAG</span>
        </button>

        <button
          id="tab-tokens"
          onClick={() => onSelectTab('tokens')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'tokens'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Design Tokens & Variables</span>
        </button>

        <button
          id="tab-editor"
          onClick={() => onSelectTab('editor')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'editor'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Real-Time Linter & CSS</span>
          {typeof lintIssueCount === 'number' && lintIssueCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                (lintErrorCount ?? 0) > 0
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                  : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
              }`}
            >
              {lintIssueCount}
            </span>
          )}
        </button>

        <button
          id="tab-registry"
          onClick={() => onSelectTab('registry')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'registry'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          <span>Docs & Registry (MDN/W3C)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
            HTML5/CSS4
          </span>
        </button>

        <button
          id="tab-legacy"
          onClick={() => onSelectTab('legacy')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'legacy'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Chrome className="w-3.5 h-3.5 text-blue-500" />
          <span>Legacy Browser Scanner</span>
          {typeof legacyRiskCount === 'number' && legacyRiskCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              {legacyRiskCount}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
              Chromium
            </span>
          )}
        </button>

        <button
          id="tab-mocktoprod"
          onClick={() => onSelectTab('mocktoprod')}
          className={`px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'mocktoprod'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Mock-to-Prod Engineering</span>
          {typeof mockToProdRiskCount === 'number' && mockToProdRiskCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {mockToProdRiskCount}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
              Layered
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
