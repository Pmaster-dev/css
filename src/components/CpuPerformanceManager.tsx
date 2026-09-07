import React from 'react';
import { 
  Cpu, 
  Zap, 
  BatteryCharging, 
  Gauge, 
  Layers, 
  AlertOctagon, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  ShieldCheck 
} from 'lucide-react';
import { CpuMetrics, CpuMode } from '../types';

interface CpuPerformanceManagerProps {
  metrics: CpuMetrics;
  cpuMode: CpuMode;
  onSelectCpuMode: (mode: CpuMode) => void;
  onApplyCpuOptimizations: () => void;
}

export const CpuPerformanceManager: React.FC<CpuPerformanceManagerProps> = ({
  metrics,
  cpuMode,
  onSelectCpuMode,
  onApplyCpuOptimizations,
}) => {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                CPU Adaptive Performance Engine
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Dynamically scales stylesheet complexity based on client hardware constraints. Prevents frame drops, excessive GPU fill-rate throttling, and battery drain on low-spec mobile cores.
            </p>
          </div>

          {/* Quick CPU Mode Switch Buttons */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-700/80">
            <button
              onClick={() => onSelectCpuMode('auto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                cpuMode === 'auto'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Auto-Adaptive
            </button>
            <button
              onClick={() => onSelectCpuMode('low-power')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                cpuMode === 'low-power'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Battery Saver
            </button>
            <button
              onClick={() => onSelectCpuMode('high')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                cpuMode === 'high'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              High Fidelity
            </button>
          </div>
        </div>

        {/* Real-time Hardware Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Logical CPU Cores</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {metrics.concurrency} Cores
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Refresh Rate</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {metrics.estimatedFps} FPS
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>Paint Frame Budget</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {metrics.paintCostMs} ms
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CPU Efficiency Score</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {metrics.overallScore} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Heavy CSS Properties & Optimizations Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Detected Render & Paint Bottlenecks
            </h3>
            <p className="text-xs text-slate-500">
              Properties that force continuous rasterization or document reflow on mobile GPUs.
            </p>
          </div>

          <button
            onClick={onApplyCpuOptimizations}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Low-CPU Fallbacks</span>
          </button>
        </div>

        {metrics.heavyPropertiesFound.length > 0 ? (
          <div className="space-y-3">
            {metrics.heavyPropertiesFound.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.property}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {item.count} occurrences
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 uppercase">
                      {item.impact} impact
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Optimal Rendering Pipeline
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No heavy blur cascades or layout-thrashing transitions found. Transitions are compositor-thread friendly.
            </p>
          </div>
        )}

        {/* Informative CPU Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              High Performance
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full multi-layer blur, 3-stop ambient shadows, spring transform keyframes. Intended for desktop gaming/workstation rigs.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20">
            <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
              Auto-Adaptive (Recommended)
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reads concurrency & device memory. Dynamically scales blur radius from 20px down to 8px and caps continuous keyframes.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">
              Battery Saver Mode
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Disables all glassmorphism filters in favor of solid tint; replaces box shadows with 1px border; halts non-essential animations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
