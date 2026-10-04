import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Layers, 
  Sliders, 
  Smartphone, 
  Laptop, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Eye, 
  RefreshCw,
  Code2,
  FileCheck,
  Zap,
  Info
} from 'lucide-react';
import { UserExperienceMode, MockToProdReport, MockToProdRisk } from '../types';
import { analyzeMockToProd, hardenMockForProduction } from '../utils/mockToProdEngine';

interface MockToProdLayerManagerProps {
  activeCss: string;
  onUpdateCss: (newCss: string) => void;
  onNavigateToPreview: () => void;
  notify: (msg: string, type?: 'success' | 'info') => void;
}

export const MockToProdLayerManager: React.FC<MockToProdLayerManagerProps> = ({
  activeCss,
  onUpdateCss,
  onNavigateToPreview,
  notify
}) => {
  const [experienceMode, setExperienceMode] = useState<UserExperienceMode>('beginner');
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [simulatorMode, setSimulatorMode] = useState<'mock-ideal' | 'prod-reality'>('prod-reality');

  // Analyze active CSS for Mock-to-Prod hazards
  const report: MockToProdReport = useMemo(() => {
    return analyzeMockToProd(activeCss);
  }, [activeCss]);

  // Selected risk detail
  const activeRisk = useMemo(() => {
    return report.risks.find(r => r.id === selectedRiskId) || report.risks[0] || null;
  }, [report.risks, selectedRiskId]);

  // Handle 1-Click Production Hardening
  const handleApplyHardening = () => {
    const { hardenedCss, transformedCount, appliedTransforms } = hardenMockForProduction(activeCss);
    if (transformedCount > 0) {
      onUpdateCss(hardenedCss);
      notify(`Hardened ${transformedCount} mock antipatterns into production-grade CSS!`);
    } else {
      notify('Stylesheet is already hardened with fluid bounds & safe-areas.', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner: Intellectual Layering Concept */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/50 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-400" />
                Intellectual Experience Layer
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-indigo-300 font-semibold">
                Bridging Mock Prototypes to Hardened Production
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Mock-to-Prod Engineering & Cognitive Transition
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Why do beautiful Figma and CodePen mocks break when deployed to real production? Mocks assume ideal desktop screens, fixed pixels, and infinite CPU power. Real production introduces dynamic mobile browser bars, camera notches, budget Android devices, and viewport reflows.
            </p>
          </div>

          {/* Experience Mode Switcher */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-2xl flex flex-col gap-1 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
              Select Your View Mode:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExperienceMode('beginner')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  experienceMode === 'beginner'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>🔰 No-Experience Guardrails</span>
              </button>

              <button
                onClick={() => setExperienceMode('intermediate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  experienceMode === 'intermediate'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>⚡ Dev Workbench</span>
              </button>

              <button
                onClick={() => setExperienceMode('architect')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  experienceMode === 'architect'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>🏛️ Architect & Manager</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Production Readiness Score & 1-Click Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Production Readiness Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold ${
                report.score >= 90 ? 'text-emerald-500' : report.score >= 60 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {report.score}/100
              </span>
              <span className="text-xs text-slate-400 font-medium capitalize">
                {report.status.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
            report.score >= 90 
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
              : report.score >= 60 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' 
              : 'bg-red-500/10 text-red-500 border border-red-500/30'
          }`}>
            {report.score >= 90 ? 'A+' : report.score >= 60 ? 'B-' : 'C'}
          </div>
        </div>

        {/* Detected Mock Hazards Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Mock-in-Prod Traps Detected
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {report.risks.length}
              </span>
              <span className="text-xs text-slate-400">
                {report.risks.filter(r => r.severity === 'critical').length} Critical
              </span>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* 1-Click Harden Button */}
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 flex flex-col justify-between">
          <div className="text-xs text-indigo-200 mb-2 font-medium">
            Transform mock artifacts into resilient, dynamic CSS:
          </div>
          <button
            onClick={handleApplyHardening}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>1-Click Harden for Production</span>
          </button>
        </div>
      </div>

      {/* LAYER 1: NO-EXPERIENCE GUARDRAILS */}
      {experienceMode === 'beginner' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Plain English Executive Guidance */}
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-emerald-100 block font-semibold mb-1">
                Plain English Summary (For Non-Engineers & Newcomers):
              </strong>
              {report.summaryPlainEnglish}
            </div>
          </div>

          {/* The 5 "Why Did My Mock Break in Prod?" FAQs */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              Common "Mock in Prod" Traps Explained In Everyday Terms
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Trap 1: The "Fixed Photo Frame" (Rigid Pixels)
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>In Mock:</strong> Setting a container to <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-red-400">width: 1200px</code> looks great on your wide laptop.
                  <br />
                  <strong>In Prod:</strong> On a smartphone (which is only 390px wide), the page overflows, forcing users to pinch-zoom and scroll horizontally.
                  <br />
                  <strong>Solution:</strong> Use <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-400">max-width: 1200px; width: 100%</code> so it shrinks naturally on phones!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Trap 2: The "Mobile Address Bar Jump" (100vh)
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>In Mock:</strong> <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-amber-400">height: 100vh</code> fills the mockup screen cleanly.
                  <br />
                  <strong>In Prod:</strong> On iPhone Safari and Android Chrome, the address bar slides in and out as the user scrolls, causing buttons at the bottom to jump or get covered up.
                  <br />
                  <strong>Solution:</strong> Use dynamic viewport height: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-400">min-height: 100dvh</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Trap 3: The "Camera Notch Collision"
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>In Mock:</strong> Floating navigation buttons sit neatly at the bottom edge (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">bottom: 0</code>).
                  <br />
                  <strong>In Prod:</strong> Real iPhones and Androids have gesture swipe bars and camera notches. Buttons get blocked by the hardware.
                  <br />
                  <strong>Solution:</strong> Use <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-400">env(safe-area-inset-bottom)</code> padding.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Trap 4: The "Battery Melter" (Heavy Blurs)
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>In Mock:</strong> Heavy frosted glass (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">backdrop-filter: blur(25px)</code>) runs smoothly on designer workstations.
                  <br />
                  <strong>In Prod:</strong> On older or budget phones, scrolling becomes jerky and drains the battery rapidly.
                  <br />
                  <strong>Solution:</strong> Provide low-power fallbacks with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-400">@media (prefers-reduced-transparency)</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAYER 2: DEVELOPER WORKBENCH */}
      {experienceMode === 'intermediate' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Interactive Risk Selector & Diff Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of Detected Risks */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Identified Mock Artifacts ({report.risks.length})
              </h3>

              {report.risks.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No mock traps detected! CSS has fluid bounds and safe-areas.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {report.risks.map((risk) => {
                    const isSelected = activeRisk?.id === risk.id;
                    return (
                      <button
                        key={risk.id}
                        onClick={() => setSelectedRiskId(risk.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              risk.severity === 'critical' ? 'bg-red-500' : risk.severity === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {risk.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {risk.plainEnglishExplanation}
                          </p>
                        </div>

                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          risk.severity === 'critical'
                            ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        }`}>
                          {risk.severity}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Risk Detail & Code Replacement Diff */}
            <div className="lg:col-span-7">
              {activeRisk ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {activeRisk.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Category: {activeRisk.category}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      Dev Diff
                    </span>
                  </div>

                  {/* Plain English vs Architectural Impact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">User Experience Impact</span>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        {activeRisk.plainEnglishExplanation}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Production Engine Impact</span>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        {activeRisk.architecturalImpact}
                      </p>
                    </div>
                  </div>

                  {/* Side-by-Side Code Diff */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Code Transformation (Mock Artifact → Hardened Prod):
                    </span>

                    <div className="space-y-2 font-mono text-xs">
                      <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300">
                        <span className="text-[10px] font-sans font-bold uppercase text-red-400 block mb-1">
                          ✕ Raw Mock Artifact:
                        </span>
                        <code>{activeRisk.mockArtifactSnippet}</code>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300">
                        <span className="text-[10px] font-sans font-bold uppercase text-emerald-400 block mb-1">
                          ✓ Hardened Production Standard:
                        </span>
                        <code>{activeRisk.prodHardenedSnippet}</code>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  Select a risk on the left to inspect its production transformation diff.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LAYER 3: ARCHITECT & MANAGER TELEMETRY */}
      {experienceMode === 'architect' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Summary */}
          <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <Cpu className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-purple-100 block font-semibold mb-1">
                Executive & Lead Architect Assessment:
              </strong>
              {report.summaryArchitect}
            </div>
          </div>

          {/* Cross-Platform Engine Matrix (Flutter vs WASM vs Adaptive CSS) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Engineering Decision Matrix: When CSS vs. Flutter vs. WASM is Optimal
                </h3>
                <p className="text-xs text-slate-500">
                  Managing tech debt between web-native responsive styles and cross-platform native rendering.
                </p>
              </div>

              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                Solutions.mbtq.dev Reference
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-500">Modern Adaptive CSS</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-600">Zero Runtime Overhead</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  <strong>Best for:</strong> Web portals, documentation, SaaS dashboards, and e-commerce. Uses browser-native GPU compositing with 0kb JS penalty.
                </p>
                <div className="text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-2 font-mono">
                  Payload: &lt;15KB gzipped • First Paint: &lt;200ms
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-500">Flutter Web & CanvasKit</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600">Cross-Platform Unified</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  <strong>Best for:</strong> Shared codebases between iOS/Android and Web requiring pixel-for-pixel visual parity. Uses Skia / Impeller rendering engine.
                </p>
                <div className="text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-2 font-mono">
                  Payload: ~1.8MB Engine • First Paint: ~800ms
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-500">WASM + CSS Hybrid</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-600">High-Compute UI</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  <strong>Best for:</strong> Audio/video editors, CAD tools, cryptography, and complex simulations. CSS handles the shell; WASM executes CPU tasks in Web Workers.
                </p>
                <div className="text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-2 font-mono">
                  Threads: Multi-threaded Workers • Near-C++ Speed
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
