import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ResponsiveViewport } from './components/ResponsiveViewport';
import { AutofixManager } from './components/AutofixManager';
import { CpuPerformanceManager } from './components/CpuPerformanceManager';
import { AccessibilityManager } from './components/AccessibilityManager';
import { DesignTokensManager } from './components/DesignTokensManager';
import { CssEditorAndExport } from './components/CssEditorAndExport';
import { DocRegistryManager } from './components/DocRegistryManager';
import { LegacySupportScanner } from './components/LegacySupportScanner';
import { MockToProdLayerManager } from './components/MockToProdLayerManager';
import { CloudBrowserNotification } from './components/CloudBrowserNotification';
import { ExportModal } from './components/ExportModal';

import { DevicePreset, ThemeMode, CpuMode, A11ySettings, CssComponentPreset, CloudBrowserSession } from './types';
import { DEVICE_PRESETS } from './data/devicePresets';
import { COMPONENT_PRESETS } from './data/preconfiguredPresets';
import { diagnoseCss, applyAutoFix } from './utils/autofixEngine';
import { analyzeCpuMetrics, generateCpuAdaptiveCss } from './utils/cpuAnalyzer';
import { lintCss } from './utils/cssLinter';
import { scanCssForLegacyIssues } from './utils/legacyBrowserScanner';
import { analyzeMockToProd } from './utils/mockToProdEngine';
import { getOrCreateCloudBrowserSession, rotateCloudBrowserSession, purgeEphemeralStorage } from './utils/cloudBrowserManager';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'preview' | 'autofix' | 'cpu' | 'tokens' | 'a11y' | 'editor' | 'registry' | 'legacy' | 'mocktoprod'>('preview');
  const [currentDevice, setCurrentDevice] = useState<DevicePreset>(DEVICE_PRESETS[1]); // iPhone 15/16 default
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [cpuMode, setCpuMode] = useState<CpuMode>('auto');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // System Cloud Browser Isolated Session State
  const [cloudSession, setCloudSession] = useState<CloudBrowserSession>(() => getOrCreateCloudBrowserSession());

  // Active Component and active CSS
  const [selectedComponent, setSelectedComponent] = useState<CssComponentPreset>(COMPONENT_PRESETS[0]);
  const [activeCss, setActiveCss] = useState<string>(COMPONENT_PRESETS[0].css);

  // Accessibility settings state
  const [a11ySettings, setA11ySettings] = useState<A11ySettings>({
    reducedMotion: false,
    forcedColors: false,
    colorBlindness: 'none',
    fontScale: 1,
    showTouchTargetOverlay: false,
    highlightSmallTargets: true,
    highContrastFocus: true,
  });

  // Sync theme mode with HTML root element
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.classList.remove('dark');
      root.removeAttribute('data-theme');
    } else if (themeMode === 'oled') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'oled');
    } else {
      root.classList.add('dark');
      root.removeAttribute('data-theme');
    }
  }, [themeMode]);

  // Show temporary toast notification (accommodates deafauth extended reading buffer)
  const notify = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    const bufferMultiplier = (a11ySettings.deafAuthProfile || a11ySettings.extendedReadingBuffer) ? 2.5 : 1;
    const durationMs = Math.round(3500 * bufferMultiplier);
    setTimeout(() => setNotification(null), durationMs);
  };

  // Run Real-time Diagnostics
  const issues = useMemo(() => {
    return diagnoseCss(activeCss);
  }, [activeCss]);

  // Run Real-time CSS Linter
  const linterResult = useMemo(() => {
    return lintCss(activeCss);
  }, [activeCss]);

  // Run Real-time Legacy Browser Compatibility Scanner
  const legacyReport = useMemo(() => {
    return scanCssForLegacyIssues(activeCss);
  }, [activeCss]);

  // Run Real-time Mock-to-Prod Engineering Analysis
  const mockToProdReport = useMemo(() => {
    return analyzeMockToProd(activeCss);
  }, [activeCss]);

  // Cloud Browser Session rotation and storage purge handlers
  const handleRotateCloudSession = () => {
    const fresh = rotateCloudBrowserSession();
    setCloudSession(fresh);
    notify('Rotated cloud browser session token. New private ephemeral context created.');
  };

  const handlePurgeCloudStorage = () => {
    purgeEphemeralStorage();
    notify('Purged ephemeral virtual DOM memory and isolated caches.');
  };

  // Run Real-time CPU Analysis
  const cpuMetrics = useMemo(() => {
    return analyzeCpuMetrics(activeCss, cpuMode);
  }, [activeCss, cpuMode]);

  // Auto-Fix specific issue
  const handleApplyFix = (issueId: string) => {
    const { newCss, fixesApplied } = applyAutoFix(activeCss, [issueId]);
    if (fixesApplied > 0) {
      setActiveCss(newCss);
      notify(`Successfully applied auto-fix for issue: ${issueId}`);
    } else {
      notify(`Issue already resolved or not present.`, 'info');
    }
  };

  // Auto-Fix All Issues
  const handleApplyAllFixes = () => {
    const issueIds = issues.map((i) => i.id);
    const { newCss, fixesApplied } = applyAutoFix(activeCss, issueIds);
    setActiveCss(newCss);
    notify(`Auto-fixed ${fixesApplied} responsive and CPU bottlenecks!`);
  };

  // Reset to original component stylesheet
  const handleResetOriginal = () => {
    setActiveCss(selectedComponent.css);
    notify('Reset CSS back to archetype default.');
  };

  // Apply CPU optimizations
  const handleApplyCpuOptimizations = () => {
    const optimized = generateCpuAdaptiveCss(activeCss, cpuMode === 'high' ? 'auto' : 'low-power');
    setActiveCss(optimized);
    notify('Injected low-power hardware acceleration and reduced-motion rules.');
  };

  // Switch preview archetype
  const handleSelectComponent = (preset: CssComponentPreset) => {
    setSelectedComponent(preset);
    setActiveCss(preset.css);
    notify(`Loaded archetype: ${preset.name}`);
  };

  // Inject fluid clamp CSS from tokens manager
  const handleInjectClampCss = (clampSnippet: string) => {
    setActiveCss((prev) => prev + '\n' + clampSnippet);
    notify('Injected fluid clamp typography tokens into active stylesheet.');
    setActiveTab('preview');
  };

  // Analyze custom user CSS
  const handleAnalyzeCustomCss = (customCss: string) => {
    setActiveCss(customCss);
    notify('Loaded custom stylesheet into Advanced CSS Studio engine.');
    setActiveTab('autofix');
  };

  // Mount block from Documentation Providers / Registry
  const handleMountBlockToStudio = (block: { name: string; html: string; css: string }) => {
    const newPreset: CssComponentPreset = {
      id: 'registry-block-' + Date.now(),
      name: block.name,
      category: 'card',
      description: 'Mounted via Documentation & Registry Providers',
      html: block.html,
      css: block.css,
      responsiveNotes: [
        'Sanitized & tokenized via HTML Sanitizer API',
        'Built with modern CSS4 & HTML5 Living Standard specifications'
      ]
    };
    setSelectedComponent(newPreset);
    setActiveCss(block.css);
    setActiveTab('preview');
    notify(`Mounted "${block.name}" to Studio Canvas!`);
  };

  // Inject CSS snippet from Doc Provider into active stylesheet
  const handleInjectCssSnippet = (cssSnippet: string) => {
    setActiveCss((prev) => `${prev}\n\n/* Injected from Documentation Provider */\n${cssSnippet}`);
    notify('Injected CSS snippet into active stylesheet!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* System Cloud Browser Isolation & Usage Privacy Notification Banner */}
      <CloudBrowserNotification
        session={cloudSession}
        onRotateSession={handleRotateCloudSession}
        onPurgeStorage={handlePurgeCloudStorage}
      />

      {/* Global Application Header */}
      <Header
        currentDevice={currentDevice}
        onSelectDevice={(device) => {
          setCurrentDevice(device);
          if (activeTab !== 'preview') setActiveTab('preview');
        }}
        themeMode={themeMode}
        onToggleTheme={setThemeMode}
        cpuMode={cpuMode}
        onSelectCpuMode={setCpuMode}
        cpuScore={cpuMetrics.overallScore}
        issueCount={issues.length}
        lintIssueCount={linterResult.issues.length}
        lintErrorCount={linterResult.errorCount}
        legacyRiskCount={legacyReport.highRiskCount + legacyReport.moderateRiskCount}
        mockToProdRiskCount={mockToProdReport.risks.length}
        onOpenExport={() => setIsExportModalOpen(true)}
        onRunAutofixAll={handleApplyAllFixes}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border transition-all ${
            a11ySettings.pinkSyncEnabled
              ? 'bg-slate-950 text-white border-pink-500 ring-2 ring-pink-500/30'
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700/50'
          } ${a11ySettings.visualHapticsPulse ? 'animate-pulse' : 'animate-bounce'}`}
        >
          <span 
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              a11ySettings.pinkSyncEnabled ? 'bg-pink-400' : 'bg-emerald-400'
            }`} 
          />
          {a11ySettings.deafAuthProfile && (
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/40">
              Visual Alert
            </span>
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Studio Work Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'preview' && (
          <ResponsiveViewport
            currentDevice={currentDevice}
            onSelectDevice={setCurrentDevice}
            activeCss={activeCss}
            themeMode={themeMode}
            cpuMode={cpuMode}
            a11ySettings={a11ySettings}
            selectedComponent={selectedComponent}
            onSelectComponent={handleSelectComponent}
            detectedIssueCount={issues.length}
            onOpenAutofix={() => setActiveTab('autofix')}
          />
        )}

        {activeTab === 'autofix' && (
          <div className="flex-1 overflow-auto">
            <AutofixManager
              issues={issues}
              onApplyFix={handleApplyFix}
              onApplyAllFixes={handleApplyAllFixes}
              onResetOriginal={handleResetOriginal}
              onAnalyzeCustomCss={handleAnalyzeCustomCss}
              currentCss={activeCss}
            />
          </div>
        )}

        {activeTab === 'cpu' && (
          <div className="flex-1 overflow-auto">
            <CpuPerformanceManager
              metrics={cpuMetrics}
              cpuMode={cpuMode}
              onSelectCpuMode={setCpuMode}
              onApplyCpuOptimizations={handleApplyCpuOptimizations}
            />
          </div>
        )}

        {activeTab === 'a11y' && (
          <div className="flex-1 overflow-auto">
            <AccessibilityManager
              settings={a11ySettings}
              onChangeSettings={setA11ySettings}
            />
          </div>
        )}

        {activeTab === 'tokens' && (
          <div className="flex-1 overflow-auto">
            <DesignTokensManager
              activeCss={activeCss}
              onUpdateCss={(newCss) => {
                setActiveCss(newCss);
                notify('Design tokens updated in active stylesheet!');
              }}
              onInjectClampCss={handleInjectClampCss}
              selectedComponent={selectedComponent}
              onNavigateToPreview={() => setActiveTab('preview')}
            />
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="flex-1 overflow-auto">
            <CssEditorAndExport
              css={activeCss}
              onChangeCss={setActiveCss}
              onResetToComponentPreset={() => setActiveCss(selectedComponent.css)}
              onNavigateToLegacyScanner={() => setActiveTab('legacy')}
            />
          </div>
        )}

        {activeTab === 'registry' && (
          <div className="flex-1 overflow-auto">
            <DocRegistryManager
              onMountBlockToStudio={handleMountBlockToStudio}
              onInjectCssSnippet={handleInjectCssSnippet}
            />
          </div>
        )}

        {activeTab === 'legacy' && (
          <div className="flex-1 overflow-auto">
            <LegacySupportScanner
              activeCss={activeCss}
              onUpdateCss={(newCss) => {
                setActiveCss(newCss);
                notify('Active CSS updated with modern alternative / legacy fallback!');
              }}
              onNavigateToEditor={() => setActiveTab('editor')}
            />
          </div>
        )}

        {activeTab === 'mocktoprod' && (
          <div className="flex-1 overflow-auto">
            <MockToProdLayerManager
              activeCss={activeCss}
              onUpdateCss={(newCss) => {
                setActiveCss(newCss);
                notify('Active CSS hardened for production environments!');
              }}
              onNavigateToPreview={() => setActiveTab('preview')}
              notify={notify}
            />
          </div>
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        css={activeCss}
      />
    </div>
  );
}
