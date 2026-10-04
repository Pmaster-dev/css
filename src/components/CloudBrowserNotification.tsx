import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  Trash2, 
  Info, 
  X, 
  Cpu, 
  CheckCircle2, 
  EyeOff, 
  Server,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { CloudBrowserSession } from '../types';

interface CloudBrowserNotificationProps {
  session: CloudBrowserSession;
  onRotateSession: () => void;
  onPurgeStorage: () => void;
}

export const CloudBrowserNotification: React.FC<CloudBrowserNotificationProps> = ({
  session,
  onRotateSession,
  onPurgeStorage
}) => {
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [copiedSession, setCopiedSession] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleCopySession = () => {
    navigator.clipboard.writeText(session.sessionId);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  const handleRotate = () => {
    onRotateSession();
    setActionNotice('Rotated ephemeral session token. New private sandbox active.');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handlePurge = () => {
    onPurgeStorage();
    setActionNotice('Purged ephemeral virtual DOM cache and isolated memory.');
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <>
      {/* Top Subtle Notification Bar */}
      <div className="bg-slate-900/90 dark:bg-slate-950/90 border-b border-indigo-900/40 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between gap-3 backdrop-blur-md z-30 transition-all">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">System Cloud Browser:</span>
          </div>

          <span className="truncate text-slate-300">
            Active & Isolated • Per-User Usage Privacy Guard
          </span>

          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-[10px] text-indigo-300 font-mono">
            <Lock className="w-2.5 h-2.5 text-emerald-400" />
            Zero-Knowledge Sandbox
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsInspectorOpen(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-900/40 hover:bg-indigo-800/60 px-2 py-0.5 rounded-md border border-indigo-700/50 transition-colors"
            title="Inspect Cloud Browser Sandbox & Privacy Isolation"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Privacy Isolation</span>
          </button>
        </div>
      </div>

      {/* Cloud Browser Privacy & Isolation Inspector Modal */}
      {isInspectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-2xl w-full shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    System Cloud Browser Isolation & Privacy
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ephemeral Per-User Sandbox • Cryptographic Isolation • Zero Data Bleed
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsInspectorOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification / Alert banner inside modal */}
            {actionNotice && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionNotice}</span>
              </div>
            )}

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Privacy Guarantee Card */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>How Your Usage & Creations Are Isolated</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  While you and the system create, diagnose, and preview adaptive CSS layouts, each session is compartmentalized inside an <strong>ephemeral, per-user memory context</strong>. Your experimental CSS, tokens, DOM trees, and diagnostics are never shared, pooled, or leaked to any other user.
                </p>
              </div>

              {/* Isolation Telemetry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Active Session ID</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-indigo-300 truncate">{session.sessionId}</span>
                    <button
                      onClick={handleCopySession}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] shrink-0 font-sans"
                    >
                      {copiedSession ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Fingerprint Hash</span>
                  <span className="text-emerald-400 truncate block">{session.fingerprintHash}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Sandbox Policy</span>
                  <span className="text-slate-300 text-[11px] block">{session.activeIframeSandbox}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Storage Isolation</span>
                  <span className="text-amber-400 text-[11px] block">Scoped Memory (Zero Cross-Origin)</span>
                </div>
              </div>

              {/* Privacy Architecture Checklist */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                  Active Privacy & Isolation Guarantees
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200">Ephemeral Storage</span>
                      <p className="text-slate-400 text-[10px]">Session memory flushes on tab close with zero persistent tracking cookies.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200">Per-User Sandboxed Canvas</span>
                      <p className="text-slate-400 text-[10px]">Preview iframes operate in strict origin partition without shared credentials.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200">CORS Delivery Shield</span>
                      <p className="text-slate-400 text-[10px]">Explicit Content-Disposition server streaming prevents unintended local writes.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200">Co-Creation Isolation</span>
                      <p className="text-slate-400 text-[10px]">Styles and layouts generated with the assistant stay locked to this instance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rotate Session Token</span>
                </button>

                <button
                  onClick={handlePurge}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Purge Ephemeral Cache</span>
                </button>
              </div>

              <button
                onClick={() => setIsInspectorOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
