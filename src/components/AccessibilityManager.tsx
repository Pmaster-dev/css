import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  Check, 
  X, 
  Wand2, 
  Smartphone, 
  Sliders, 
  Sparkles, 
  Contrast, 
  MousePointer, 
  Volume2, 
  VolumeX,
  Bell,
  BellOff,
  ShieldCheck,
  FileText,
  Download,
  Copy,
  Terminal,
  ExternalLink,
  RefreshCw,
  Heart,
  Globe,
  Radio,
  Zap
} from 'lucide-react';
import { A11ySettings, ColorBlindnessType } from '../types';
import { calculateContrast, suggestAccessibleColor } from '../utils/contrast';
import {
  generatePreferencesTxt,
  downloadPreferencesTxtFile,
  PINKSYNC_PALETTE,
  DEAFAUTH_DEFAULTS,
} from '../utils/preferencesTxtGenerator';

interface AccessibilityManagerProps {
  settings: A11ySettings;
  onChangeSettings: (settings: A11ySettings) => void;
}

export const AccessibilityManager: React.FC<AccessibilityManagerProps> = ({
  settings,
  onChangeSettings,
}) => {
  // Contrast test state
  const [fgColor, setFgColor] = useState('#60a5fa');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showTxtPreview, setShowTxtPreview] = useState(false);
  const [isSyncingServer, setIsSyncingServer] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const contrastResult = calculateContrast(fgColor, bgColor);

  const handleRemediateContrast = (targetRatio = 4.5) => {
    const fixed = suggestAccessibleColor(fgColor, bgColor, targetRatio);
    setFgColor(fixed);
  };

  const userEmail = settings.userProfileEmail || '8pinkycollie8@gmail.com';
  const serverOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // Generate live .txt manifest
  const txtManifest = useMemo(() => {
    return generatePreferencesTxt(settings, userEmail, serverOrigin);
  }, [settings, userEmail, serverOrigin]);

  const curlCommand = `curl -s -H "Origin: desktop-client" "${serverOrigin}/api/preferences/desktop-delivery.txt" -o "deafauth-pinksync-preferences.txt"`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadTxt = () => {
    downloadPreferencesTxtFile(txtManifest, 'deafauth-pinksync-user-preferences.txt');
    handleCopy(txtManifest, 'downloaded');
  };

  const handleToggleDeafAuth = () => {
    const nextVal = !settings.deafAuthProfile;
    onChangeSettings({
      ...settings,
      deafAuthProfile: nextVal,
      visualAlertsOnly: nextVal ? true : settings.visualAlertsOnly,
      subtitlesAndCaptions: nextVal ? true : settings.subtitlesAndCaptions,
      highContrastFocus: nextVal ? true : settings.highContrastFocus,
      visualHapticsPulse: nextVal ? true : settings.visualHapticsPulse,
      extendedReadingBuffer: nextVal ? true : settings.extendedReadingBuffer,
    });
  };

  const handleTogglePinkSync = () => {
    onChangeSettings({
      ...settings,
      pinkSyncEnabled: !settings.pinkSyncEnabled,
      userProfileEmail: userEmail,
    });
  };

  const handleSyncToServer = async () => {
    setIsSyncingServer(true);
    setSyncStatus(null);
    try {
      const resp = await fetch('/api/preferences/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          profileId: 'deafauth',
          themeSync: 'pinksync',
          visualAlertsOnly: settings.visualAlertsOnly ?? true,
          subtitlesAndCaptions: settings.subtitlesAndCaptions ?? true,
          highContrastFocus: settings.highContrastFocus ?? true,
          visualHapticsPulse: settings.visualHapticsPulse ?? true,
          extendedReadingBuffer: settings.extendedReadingBuffer ?? true,
          fontScale: settings.fontScale,
          reducedMotion: settings.reducedMotion,
          forcedColors: settings.forcedColors,
          colorBlindness: settings.colorBlindness,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setSyncStatus('Successfully synchronized with server & CORS desktop delivery endpoint!');
      } else {
        setSyncStatus('Sync responded without success flag.');
      }
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err?.message || 'Server unreachable'}`);
    } finally {
      setIsSyncingServer(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Accessibility (a11y) & WCAG Diagnostics Suite
          </h2>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Verify WCAG 2.1 AA/AAA compliance across responsive viewports. Test high-contrast color schemes, color vision deficiency filters, 200% dynamic text scaling, and minimum 44px touch targets.
        </p>
      </div>

      {/* WCAG 2.1 Contrast Testing Studio */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Contrast className="w-4 h-4 text-blue-500" />
              <span>WCAG 2.1 Color Contrast Analyzer & Auto-Remediator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live mathematical luminance evaluation of text against container surfaces.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRemediateContrast(4.5)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Fix for AA (4.5:1)</span>
            </button>
            <button
              onClick={() => handleRemediateContrast(7.0)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Fix for AAA (7.0:1)</span>
            </button>
          </div>
        </div>

        {/* Contrast Interactive Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Color pickers */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Foreground (Text / Icon)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Background (Surface)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Swatch */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-inner border border-slate-300 dark:border-slate-700 transition-colors"
            style={{ backgroundColor: bgColor, color: fgColor }}
          >
            <div className="text-2xl font-bold tracking-tight mb-1">
              Sample Heading Text
            </div>
            <div className="text-sm opacity-90 max-w-xs">
              Body text preview with current contrast ratio of {contrastResult.ratioString}
            </div>
          </div>

          {/* Contrast Score Card */}
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Contrast Ratio
              </div>
              <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                {contrastResult.ratioString}
              </div>
              <div className="mt-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    contrastResult.level === 'AAA'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : contrastResult.level === 'AA'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                  }`}
                >
                  Rating: {contrastResult.level}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">AA Normal</span>
                {contrastResult.aaNormal ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">AA Large</span>
                {contrastResult.aaLarge ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">AAA Normal</span>
                {contrastResult.aaaNormal ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">AAA Large</span>
                {contrastResult.aaaLarge ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Toggles & Viewport Enhancements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Vision Deficiency Simulation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Color Vision Deficiency Filter (Daltonism)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Simulate how your site appears to users with color blindness directly inside the live viewport canvas.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'none', label: 'Normal Vision' },
                { id: 'protanopia', label: 'Protanopia (Red-blind)' },
                { id: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
                { id: 'tritanopia', label: 'Tritanopia (Blue-blind)' },
                { id: 'achromatopsia', label: 'Monochromacy' },
              ] as { id: ColorBlindnessType; label: string }[]
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() =>
                  onChangeSettings({ ...settings, colorBlindness: filter.id })
                }
                className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  settings.colorBlindness === filter.id
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Font Scaler & Touch Targets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Dynamic Type Scaling (WCAG 1.4.4)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Test whether containers blow out or clip when the user zooms system text up to 200%.
          </p>

          <div className="flex items-center gap-2">
            {[1, 1.25, 1.5, 2.0].map((scale) => (
              <button
                key={scale}
                onClick={() => onChangeSettings({ ...settings, fontScale: scale })}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  settings.fontScale === scale
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {scale * 100}%
              </button>
            ))}
          </div>

          {/* Quick Toggles */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reduced Motion Simulation (prefers-reduced-motion)
              </span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) =>
                  onChangeSettings({ ...settings, reducedMotion: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Touch Target Heatmap Overlay (≥44x44px minimum)
              </span>
              <input
                type="checkbox"
                checked={settings.showTouchTargetOverlay}
                onChange={(e) =>
                  onChangeSettings({ ...settings, showTouchTargetOverlay: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Windows High Contrast / forced-colors simulation
              </span>
              <input
                type="checkbox"
                checked={settings.forcedColors}
                onChange={(e) =>
                  onChangeSettings({ ...settings, forcedColors: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>
          </div>
        </div>
      </div>

      {/* DEAFAUTH & PINKSYNC USER PREFERENCES (.TXT) & CORS DESKTOP DELIVERY SUITE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Header Ribbon */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-pink-950/20 via-rose-950/10 to-transparent dark:from-pink-950/40 dark:via-slate-900">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>User Preferences & Accessibility Manifest (.txt)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-800 font-mono">
                      deafauth + pinksync
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Deaf & Hard-of-Hearing accessibility defaults paired with the PinkSync high-contrast design token palette. Formatted as plain text (.txt) and delivered with CORS for external desktop agents, local CLI, and extensions.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                <span>PinkSync: {settings.pinkSyncEnabled ? 'Active' : 'Standby'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Globe className="w-3 h-3 text-emerald-500" />
                <span>CORS Desktop: Enabled</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white transition-all flex items-center gap-1.5 shadow-xs"
              title="Download user preferences as a .txt file for desktop storage"
            >
              {copiedKey === 'downloaded' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>Download .txt File</span>
            </button>

            <button
              onClick={() => handleCopy(txtManifest, 'manifest-copied')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              title="Copy the .txt manifest content directly to clipboard"
            >
              {copiedKey === 'manifest-copied' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy .txt</span>
            </button>

            <button
              onClick={() => handleCopy(curlCommand, 'curl-copied')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 font-mono"
              title="Copy the cURL command for desktop external retrieval"
            >
              {copiedKey === 'curl-copied' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Terminal className="w-3.5 h-3.5" />}
              <span>Copy cURL</span>
            </button>

            <button
              onClick={handleSyncToServer}
              disabled={isSyncingServer}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              title="Push preferences to backend sync endpoint"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingServer ? 'animate-spin text-pink-500' : ''}`} />
              <span>Sync Server</span>
            </button>
          </div>

          <button
            onClick={() => setShowTxtPreview(!showTxtPreview)}
            className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
          >
            <span>{showTxtPreview ? 'Hide Raw .txt Preview' : 'View Raw .txt Preview'}</span>
          </button>
        </div>

        {/* Sync notification banner if triggered */}
        {syncStatus && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Configuration Split Panels */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: DeafAuth Profile Accommodations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Deaf & Hard-of-Hearing Defaults (<code className="text-pink-600">deafauth</code>)
                </h4>
              </div>
              <button
                onClick={handleToggleDeafAuth}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  settings.deafAuthProfile
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {settings.deafAuthProfile ? 'DeafAuth Enabled' : 'Enable Defaults'}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Converts all auditory pings to persistent visual indicators, enforces closed captions, and expands notification timeouts for comfortable reading.
            </p>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Visual Alerts Only (No Auditory Reliance)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Renders screen flash cues and badges instead of sound chimes
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.visualAlertsOnly ?? DEAFAUTH_DEFAULTS.visualAlertsOnly}
                  onChange={(e) =>
                    onChangeSettings({ ...settings, visualAlertsOnly: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Enforce Subtitles & Closed Captions
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Always requests transcripts and subtitle tracks on all media players
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.subtitlesAndCaptions ?? DEAFAUTH_DEFAULTS.subtitlesAndCaptions}
                  onChange={(e) =>
                    onChangeSettings({ ...settings, subtitlesAndCaptions: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Visual Haptic Pulse on Click/Interaction
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Emits subtle pink focus ring wave on button taps and state transitions
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.visualHapticsPulse ?? DEAFAUTH_DEFAULTS.visualHapticsPulse}
                  onChange={(e) =>
                    onChangeSettings({ ...settings, visualHapticsPulse: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Extended Reading Timeout Buffer (2.5x)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Extends toast durations and banners from 3.5s to 8.5s to prevent miss-reads
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.extendedReadingBuffer ?? DEAFAUTH_DEFAULTS.extendedReadingBuffer}
                  onChange={(e) =>
                    onChangeSettings({ ...settings, extendedReadingBuffer: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    High-Contrast 4px Focus Ring
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Solid #db2777 outline with 2px offset for crystal-clear spatial navigation
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highContrastFocus}
                  onChange={(e) =>
                    onChangeSettings({ ...settings, highContrastFocus: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                />
              </label>
            </div>
          </div>

          {/* Right: PinkSync Palette & Desktop Delivery Hook */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  PinkSync Token Palette & User Identity
                </h4>
              </div>
              <button
                onClick={handleTogglePinkSync}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  settings.pinkSyncEnabled
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {settings.pinkSyncEnabled ? 'PinkSync Active' : 'Sync Palette'}
              </button>
            </div>

            {/* User Identity Banner */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Synced User Account:</span>
              <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                {userEmail}
              </span>
            </div>

            {/* PinkSync Swatch Grid */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Active High-Contrast Color Variables:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-lg shadow-xs border border-black/10 shrink-0"
                    style={{ backgroundColor: PINKSYNC_PALETTE.primary }}
                  />
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      --pinksync-primary
                    </div>
                    <div className="text-[10px] text-slate-400">{PINKSYNC_PALETTE.primary}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-lg shadow-xs border border-black/10 shrink-0"
                    style={{ backgroundColor: PINKSYNC_PALETTE.accent }}
                  />
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      --pinksync-accent
                    </div>
                    <div className="text-[10px] text-slate-400">{PINKSYNC_PALETTE.accent}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-lg shadow-xs border border-black/10 shrink-0"
                    style={{ backgroundColor: PINKSYNC_PALETTE.focusRing }}
                  />
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      --pinksync-focus
                    </div>
                    <div className="text-[10px] text-slate-400">{PINKSYNC_PALETTE.focusRing}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-lg shadow-xs border border-black/10 shrink-0"
                    style={{ backgroundColor: PINKSYNC_PALETTE.surfaceDark }}
                  />
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      --pinksync-surface
                    </div>
                    <div className="text-[10px] text-slate-400">{PINKSYNC_PALETTE.surfaceDark}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CORS External Desktop Delivery Details */}
            <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CORS Ext Desktop Delivery Hook</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HTTP 200 text/plain
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fetch this manifest from any desktop app, daemon, or extension without CORS blocks.
              </p>
              <div className="relative">
                <pre className="p-2.5 rounded-lg bg-black/60 text-slate-300 font-mono text-[11px] overflow-x-auto pr-16 select-all">
                  {curlCommand}
                </pre>
                <button
                  onClick={() => handleCopy(curlCommand, 'box-curl')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-white flex items-center gap-1"
                >
                  {copiedKey === 'box-curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'box-curl' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Live .txt Manifest Viewer */}
        {showTxtPreview && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-950 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">
                RAW TEXT PREVIEW: deafauth-pinksync-user-preferences.txt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(txtManifest, 'drawer-copy')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1"
                >
                  {copiedKey === 'drawer-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            <pre className="p-4 rounded-xl bg-black/80 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed select-all">
              {txtManifest}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
