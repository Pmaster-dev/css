import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Layers, 
  ShieldAlert, 
  Sliders,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DevicePreset, ThemeMode, A11ySettings, CssComponentPreset, CpuMode } from '../types';
import { DEVICE_PRESETS } from '../data/devicePresets';
import { COMPONENT_PRESETS } from '../data/preconfiguredPresets';

interface ResponsiveViewportProps {
  currentDevice: DevicePreset;
  onSelectDevice: (device: DevicePreset) => void;
  activeCss: string;
  themeMode: ThemeMode;
  cpuMode: CpuMode;
  a11ySettings: A11ySettings;
  selectedComponent: CssComponentPreset;
  onSelectComponent: (preset: CssComponentPreset) => void;
  detectedIssueCount: number;
  onOpenAutofix: () => void;
}

export const ResponsiveViewport: React.FC<ResponsiveViewportProps> = ({
  currentDevice,
  onSelectDevice,
  activeCss,
  themeMode,
  cpuMode,
  a11ySettings,
  selectedComponent,
  onSelectComponent,
  detectedIssueCount,
  onOpenAutofix,
}) => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [customWidth, setCustomWidth] = useState<number>(currentDevice.width);
  const [zoom, setZoom] = useState<number>(1);
  const [isResizing, setIsResizing] = useState(false);
  const [showRuler, setShowRuler] = useState(true);

  // Sync custom width when device preset changes
  useEffect(() => {
    setCustomWidth(isLandscape ? currentDevice.height : currentDevice.width);
  }, [currentDevice, isLandscape]);

  const activeWidth = isLandscape ? currentDevice.height : customWidth;
  const activeHeight = isLandscape ? currentDevice.width : currentDevice.height;

  // Determine active Tailwind-style breakpoint
  const getBreakpoint = (w: number) => {
    if (w < 640) return { label: 'Mobile (xs)', color: 'text-amber-500' };
    if (w < 768) return { label: 'Small Tablet (sm)', color: 'text-blue-500' };
    if (w < 1024) return { label: 'Tablet (md)', color: 'text-indigo-500' };
    if (w < 1280) return { label: 'Laptop (lg)', color: 'text-purple-500' };
    return { label: 'Desktop / Ultrawide (xl/2xl)', color: 'text-emerald-500' };
  };

  const currentBp = getBreakpoint(activeWidth);

  // Handle drag resizing
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = activeWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Adjust width symmetrically or single edge
      const newWidth = Math.max(280, Math.min(1800, Math.round(startWidth + deltaX * (1 / zoom))));
      setCustomWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Build scoped dynamic styling
  const scopedCss = `
    .viewport-sandbox-root {
      font-size: ${a11ySettings.fontScale * 100}%;
      ${a11ySettings.forcedColors ? 'forced-color-adjust: none; color: WindowText; background: Window;' : ''}
      ${a11ySettings.pinkSyncEnabled ? `
        --pinksync-primary: #ec4899;
        --pinksync-accent: #f43f5e;
        --pinksync-surface: #fdf2f8;
        --pinksync-border: #f472b6;
        --pinksync-focus: #db2777;
      ` : ''}
    }
    ${a11ySettings.highContrastFocus ? `
      .viewport-sandbox-root *:focus-visible {
        outline: 4px solid ${a11ySettings.pinkSyncEnabled ? '#db2777' : '#2563eb'} !important;
        outline-offset: 2px !important;
      }
    ` : ''}
    ${a11ySettings.visualHapticsPulse ? `
      .viewport-sandbox-root button:active, .viewport-sandbox-root a:active {
        box-shadow: 0 0 0 4px #ec4899 !important;
        transition: box-shadow 0.1s ease-in-out;
      }
    ` : ''}
    ${activeCss}
  `;

  // Color blindness SVG filter mapping
  const getColorBlindnessFilter = () => {
    switch (a11ySettings.colorBlindness) {
      case 'protanopia':
        return 'url(#filter-protanopia)';
      case 'deuteranopia':
        return 'url(#filter-deuteranopia)';
      case 'tritanopia':
        return 'url(#filter-tritanopia)';
      case 'achromatopsia':
        return 'grayscale(100%)';
      default:
        return 'none';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/70 dark:bg-slate-950/80 transition-colors select-none">
      {/* Viewport Control Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Component & Archetype Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Preview Archetype:
          </span>
          <select
            id="select-preview-preset"
            value={selectedComponent.id}
            onChange={(e) => {
              const found = COMPONENT_PRESETS.find((p) => p.id === e.target.value);
              if (found) onSelectComponent(found);
            }}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            {COMPONENT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} ({preset.category})
              </option>
            ))}
          </select>

          {/* Quick Issue Badge */}
          {detectedIssueCount > 0 ? (
            <button
              onClick={onOpenAutofix}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            >
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span>{detectedIssueCount} Responsive Issues</span>
              <span className="text-[10px] underline ml-1">Auto-Fix</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>Fluid & Safe (0 Issues)</span>
            </div>
          )}
        </div>

        {/* Center: Live Dimensions, Breakpoint Tag, and Ruler Switch */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            <span>{activeWidth}px</span>
            <span className="text-slate-400">×</span>
            <span>{activeHeight}px</span>
            <span className="text-[10px] text-slate-400">({(activeWidth / 16).toFixed(1)}rem)</span>
          </div>
          <span className="w-px h-3.5 bg-slate-300 dark:bg-slate-700" />
          <span className={`text-[11px] font-semibold ${currentBp.color}`}>
            {currentBp.label}
          </span>
        </div>

        {/* Right: Orientation, Zoom, and Quick Devices */}
        <div className="flex items-center gap-2">
          {/* Orientation Toggle */}
          <button
            id="btn-toggle-orientation"
            onClick={() => setIsLandscape(!isLandscape)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isLandscape
                ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title="Rotate Viewport Orientation"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">
              {isLandscape ? 'Landscape' : 'Portrait'}
            </span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setZoom(Math.max(0.4, parseFloat((zoom - 0.1).toFixed(1))))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[11px] font-mono px-1.5 font-semibold text-slate-700 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.5, parseFloat((zoom + 0.1).toFixed(1))))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              title="Reset 100%"
            >
              Reset
            </button>
          </div>

          {/* Touch Target Overlay Toggle */}
          <button
            onClick={() => setShowRuler(!showRuler)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              showRuler
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 text-blue-600 dark:text-blue-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Toggle Breakpoint Guide Bar"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Breakpoint Visual Reference Ruler */}
      {showRuler && (
        <div className="bg-slate-200/90 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 px-6 py-1 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 overflow-x-auto">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>xs: &lt;640px</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>sm: 640px</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>md: 768px</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>lg: 1024px</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>xl: 1280px+</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Interactive Viewport: Drag right edge to resize
            </span>
          </div>
        </div>
      )}

      {/* Center Canvas Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start min-h-[520px]">
        {/* Viewport Frame with Resizable Edge */}
        <div
          className="relative transition-all duration-75"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Device Chassis Frame */}
          <div
            id="viewport-canvas-container"
            className={`relative rounded-2xl overflow-hidden shadow-2xl border transition-all ${
              themeMode === 'light'
                ? 'bg-white border-slate-300 shadow-slate-300/50'
                : themeMode === 'oled'
                ? 'bg-black border-slate-800 shadow-black'
                : 'bg-slate-900 border-slate-800 shadow-slate-950/80'
            }`}
            style={{
              width: `${activeWidth}px`,
              minHeight: `${Math.min(activeHeight, 820)}px`,
              filter: getColorBlindnessFilter(),
            }}
          >
            {/* Safe Area Dynamic Island / Mobile Notch Simulator if mobile */}
            {currentDevice.type === 'mobile' && currentDevice.hasNotch && !isLandscape && (
              <div className="w-full flex justify-center pt-2 pb-1 bg-inherit z-30 relative">
                <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                </div>
              </div>
            )}

            {/* Injected Scoped CSS Stylesheet */}
            <style dangerouslySetInnerHTML={{ __html: scopedCss }} />

            {/* Rendered HTML Sandbox */}
            <div
              className={`viewport-sandbox-root w-full h-full min-h-[500px] ${
                a11ySettings.reducedMotion ? 'motion-reduce' : ''
              } ${a11ySettings.showTouchTargetOverlay ? 'highlight-touch-targets' : ''}`}
              dangerouslySetInnerHTML={{ __html: selectedComponent.html }}
            />

            {/* Touch Target Verification Badge overlay */}
            {a11ySettings.showTouchTargetOverlay && (
              <div className="absolute bottom-3 right-3 z-30 bg-black/80 text-white text-[11px] px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-xs flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Touch Target Overlay Active (≥44px green)</span>
              </div>
            )}
          </div>

          {/* Right Drag Handle for Fluid Resizing */}
          <div
            onMouseDown={handleMouseDownResize}
            className={`absolute top-0 -right-4 w-3 h-full cursor-ew-resize flex items-center justify-center group ${
              isResizing ? 'opacity-100' : 'opacity-40 hover:opacity-100'
            }`}
            title="Drag to resize viewport width"
          >
            <div className="w-1.5 h-16 rounded-full bg-blue-500 group-hover:bg-blue-600 group-hover:h-24 transition-all" />
          </div>
        </div>
      </div>

      {/* SVG Filters for Color Blindness Simulation */}
      <svg className="hidden">
        <defs>
          {/* Protanopia (Red weak/blind) */}
          <filter id="filter-protanopia">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0,     0, 0
                      0.558, 0.442, 0,     0, 0
                      0,     0.242, 0.758, 0, 0
                      0,     0,     0,     1, 0"
            />
          </filter>
          {/* Deuteranopia (Green weak/blind) */}
          <filter id="filter-deuteranopia">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0,   0, 0
                      0.7,   0.3,   0,   0, 0
                      0,     0.3,   0.7, 0, 0
                      0,     0,     0,   1, 0"
            />
          </filter>
          {/* Tritanopia (Blue weak/blind) */}
          <filter id="filter-tritanopia">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05,  0,     0, 0
                      0,    0.433, 0.567, 0, 0
                      0,    0.475, 0.525, 0, 0
                      0,    0,     0,     1, 0"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
