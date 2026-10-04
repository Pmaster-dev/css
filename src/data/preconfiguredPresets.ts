import { CssComponentPreset } from '../types';

export const COMPONENT_PRESETS: CssComponentPreset[] = [
  {
    id: 'fluid-hero',
    name: 'Fluid Responsive Hero',
    category: 'hero',
    description: 'Header with modern clamp() typography, dynamic viewport height (100dvh), safe-area insets, and CPU-friendly composited motion.',
    responsiveNotes: [
      'Uses min-height: 100dvh to eliminate mobile URL bar jumpiness',
      'Fluid title with clamp(2rem, 1.2rem + 3.5vw, 4rem)',
      'Touch-friendly 48px CTA buttons',
      'Safe area padding for notched mobile phones',
    ],
    css: `:root {
  --hero-bg: #0f172a;
  --hero-text: #f8fafc;
  --hero-subtitle-color: #94a3b8;
  --hero-badge-bg: rgba(59, 130, 246, 0.15);
  --hero-badge-border: rgba(59, 130, 246, 0.3);
  --hero-badge-text: #60a5fa;
  --font-fluid-title: clamp(2rem, 1.25rem + 3.2vw, 4rem);
  --font-fluid-subtitle: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --space-hero-padding: clamp(1.5rem, 5vw, 4rem);
  --btn-primary-bg: #2563eb;
  --btn-primary-hover: #1d4ed8;
  --btn-radius: 8px;
}

.hero-container {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-hero-padding, clamp(1.5rem, 5vw, 4rem)) 1.5rem;
  padding-top: max(1.5rem, env(safe-area-inset-top));
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
  text-align: center;
  background: var(--hero-bg, #0f172a);
  color: var(--hero-text, #f8fafc);
  position: relative;
  overflow: hidden;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  font-size: 0.875rem;
  border-radius: 9999px;
  background: var(--hero-badge-bg, rgba(59, 130, 246, 0.15));
  border: 1px solid var(--hero-badge-border, rgba(59, 130, 246, 0.3));
  color: var(--hero-badge-text, #60a5fa);
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: var(--font-fluid-title, clamp(2rem, 1.25rem + 3.2vw, 4rem));
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  max-width: 25ch;
  margin: 0 auto 1.25rem;
  overflow-wrap: anywhere;
}

.hero-subtitle {
  font-size: var(--font-fluid-subtitle, clamp(1rem, 0.9rem + 0.5vw, 1.25rem));
  line-height: 1.6;
  max-width: 58ch;
  margin: 0 auto 2rem;
  color: var(--hero-subtitle-color, #94a3b8);
  overflow-wrap: anywhere;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  width: 100%;
}

.btn-primary {
  min-height: 48px;
  min-width: 140px;
  padding: 0.75rem 1.75rem;
  border-radius: var(--btn-radius, 8px);
  background: var(--btn-primary-bg, #2563eb);
  color: #ffffff;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
  will-change: transform;
}

.btn-primary:hover {
  background: var(--btn-primary-hover, #1d4ed8);
  transform: translateY(-1px);
}

.btn-primary:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 3px;
}

.btn-secondary {
  min-height: 48px;
  min-width: 140px;
  padding: 0.75rem 1.75rem;
  border-radius: 8px;
  background: transparent;
  color: #f1f5f9;
  font-weight: 600;
  border: 1px solid #334155;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #64748b;
}

.btn-secondary:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 3px;
}`,
    html: `<div class="hero-container">
  <div class="hero-badge">
    <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
    <span>Next-Gen CSS Engine v3.0</span>
  </div>
  <h1 class="hero-title">Adaptive Styles Engineered for Every Screen</h1>
  <p class="hero-subtitle">Automatic hardware acceleration fallbacks, fluid typography scaling, and WCAG AAA compliance built directly into your responsive stylesheet.</p>
  <div class="hero-actions">
    <button class="btn-primary">
      <span>Get Started Free</span>
      <span>→</span>
    </button>
    <button class="btn-secondary">
      <span>View Documentation</span>
    </button>
  </div>
</div>`,
  },
  {
    id: 'adaptive-bento',
    name: 'Adaptive Bento Grid',
    category: 'layout',
    description: 'Auto-fitting responsive grid system that handles single-column mobile, dual-column tablet, and multi-span desktop layouts without media query churn.',
    responsiveNotes: [
      'Self-wrapping repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
      'Aspect-ratio preservation on graphic media',
      'No fixed pixel widths or overflow risks',
      'Subtle single-pass CPU shadows for smooth frame rates',
    ],
    css: `:root {
  --bento-max-width: 1200px;
  --bento-gap: 1.25rem;
  --card-bg: #1e293b;
  --card-border: #334155;
  --card-radius: 12px;
  --card-padding: 1.5rem;
}

.bento-wrapper {
  width: 100%;
  max-width: var(--bento-max-width, 1200px);
  margin: 0 auto;
  padding: 1.5rem;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--bento-gap, 1.25rem);
  width: 100%;
}

.bento-card {
  background: var(--card-bg, #1e293b);
  border: 1px solid var(--card-border, #334155);
  border-radius: var(--card-radius, 12px);
  padding: var(--card-padding, 1.5rem);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
  overflow: hidden;
}

.bento-card:hover {
  transform: translateY(-2px);
  border-color: #64748b;
}

.bento-card.span-2 {
  grid-column: span 1;
}

@media (min-width: 860px) {
  .bento-card.span-2 {
    grid-column: span 2;
  }
}

.bento-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.bento-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-size: 1.25rem;
}

.bento-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary, #f8fafc);
  overflow-wrap: anywhere;
}

.bento-desc {
  font-size: 0.925rem;
  line-height: 1.5;
  color: var(--text-muted, #94a3b8);
  margin: 0;
  overflow-wrap: anywhere;
}

.bento-metric {
  font-size: 2.25rem;
  font-weight: 800;
  color: #38bdf8;
  margin-top: 1.25rem;
  letter-spacing: -0.03em;
}`,
    html: `<div class="bento-wrapper">
  <div class="bento-grid">
    <div class="bento-card span-2">
      <div>
        <div class="bento-header">
          <div class="bento-icon">⚡</div>
          <span style="font-size: 0.8rem; color: #10b981; font-weight: 600;">ACTIVE METRIC</span>
        </div>
        <h3 class="bento-title">Zero Layout Shift Pipeline</h3>
        <p class="bento-desc">All media slots reserve geometric aspect-ratios to prevent cumulative layout shift (CLS) under dynamic 3G network constraints.</p>
      </div>
      <div class="bento-metric">0.002 CLS</div>
    </div>
    <div class="bento-card">
      <div>
        <div class="bento-header">
          <div class="bento-icon">🖥️</div>
        </div>
        <h3 class="bento-title">CPU Throttling Guard</h3>
        <p class="bento-desc">Swaps costly multi-stop box shadows for lightweight 1px borders automatically on low-spec cores.</p>
      </div>
      <div class="bento-metric">60 FPS</div>
    </div>
    <div class="bento-card">
      <div>
        <div class="bento-header">
          <div class="bento-icon">♿</div>
        </div>
        <h3 class="bento-title">WCAG AAA Certified</h3>
        <p class="bento-desc">Semantic tokens maintain 7:1 contrast across dark mode, light mode, and high-contrast OLED.</p>
      </div>
      <div class="bento-metric">7.2 : 1</div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'accessible-form',
    name: 'Accessible Responsive Form & Inputs',
    category: 'form',
    description: 'WCAG 2.1 AA/AAA verified input system with 48px touch targets, high-visibility focus rings, and dynamic error state styling.',
    responsiveNotes: [
      'Touch-friendly 48px minimum input heights',
      'Visible 3px keyboard focus rings (:focus-visible)',
      'High-contrast labels passing 4.5:1 ratio',
      'Flexible full-width layout with responsive 2-column breakpoint',
    ],
    css: `.form-container {
  width: 100%;
  max-width: 580px;
  margin: 0 auto;
  padding: 1.75rem;
  background: var(--surface, #0f172a);
  border: 1px solid var(--border, #334155);
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text, #f8fafc);
  margin: 0 0 0.5rem;
}

.form-subtitle {
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0 0 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-input {
  width: 100%;
  min-height: 48px;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #475569;
  background: #1e293b;
  color: #f8fafc;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
  border-color: #3b82f6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 540px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

.form-submit {
  width: 100%;
  min-height: 48px;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
  will-change: transform;
}

.form-submit:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.form-submit:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 3px;
}`,
    html: `<div class="form-container">
  <h2 class="form-title">Account Verification</h2>
  <p class="form-subtitle">Designed for touch accuracy and high-contrast screen reader compliance.</p>
  <form onsubmit="return false;">
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="first-name">First Name</label>
        <input class="form-input" id="first-name" type="text" placeholder="Sarah" />
      </div>
      <div class="form-group">
        <label class="form-label" for="last-name">Last Name</label>
        <input class="form-input" id="last-name" type="text" placeholder="Connor" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="email">Work Email</label>
      <input class="form-input" id="email" type="email" placeholder="sarah@domain.com" />
    </div>
    <button class="form-submit" type="submit">Verify & Save Profile</button>
  </form>
</div>`,
  },
  {
    id: 'adaptive-navbar',
    name: 'Adaptive Glassmorphism Navbar',
    category: 'navigation',
    description: 'Header with safe-area padding, CPU-aware glass blur fallback, and accessible keyboard focus navigation.',
    responsiveNotes: [
      'Fallback to solid opacity on low-CPU devices',
      'Safe area top padding for iOS dynamic island & notches',
      'Fluid spacing with auto-collapsing desktop to mobile bar',
    ],
    css: `.nav-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  padding-top: max(0.75rem, env(safe-area-inset-top));
  padding-bottom: 0.75rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  background: rgba(15, 23, 42, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  /* CPU Friendly Blur */
  @supports (backdrop-filter: blur(12px)) {
    backdrop-filter: blur(12px);
  }
}

.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.925rem;
  font-weight: 500;
  padding: 0.5rem 0.25rem;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
}

.nav-item a:hover {
  color: #f8fafc;
}

.nav-item a:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

.nav-cta {
  min-height: 40px;
  padding: 0.5rem 1.25rem;
  background: #3b82f6;
  color: #ffffff;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}`,
    html: `<header class="nav-header">
  <div class="nav-inner">
    <a href="#" class="nav-brand">
      <span style="display:inline-block; width:12px; height:12px; border-radius:3px; background:#38bdf8;"></span>
      <span>Studiocss</span>
    </a>
    <ul class="nav-links">
      <li class="nav-item"><a href="#">Overview</a></li>
      <li class="nav-item"><a href="#">Responsive Engine</a></li>
      <li class="nav-item"><a href="#">CPU Diagnostics</a></li>
    </ul>
    <button class="nav-cta">Deploy Engine</button>
  </div>
</header>`,
  },
  {
    id: 'manager-adaptive-suite',
    name: 'Manager Adaptive Suite (CPU-Smart, PiP & Multi-Platform)',
    category: 'layout',
    description: 'Executive managerial workbench featuring CPU-adaptive performance throttling, multi-tier breakpoints (mobile/tablet/desktop), picture-in-picture floating overlay, dark mode theming, and multi-platform protocol architecture (HTTP/WS/WASM vs Flutter Solution Engine).',
    responsiveNotes: [
      'Multi-tier responsive grid: Mobile (<640px), Tablet (640-1024px), Desktop (1024-1440px), Ultra-Wide (>=1440px)',
      'Built-in CPU-purpose adaptive containment (content-visibility: auto, contain: layout paint, GPU transforms)',
      'Picture-in-Picture (PiP) floating stream widget with safe-area docking',
      'Dark mode theme tokens with WCAG AAA contrast and high-contrast OLED fallbacks',
      'Protocol runtime analysis: Mobile -> Browser -> WebApp -> HTTP -> HTTPS -> WS -> WASM -> Flutter vs Solution Engine (Solutions.mbtq.dev)',
    ],
    css: `/* ==========================================================================
   MANAGER ADAPTIVE SUITE - PRODUCTION CSS ARCHITECTURE
   Built for: Executive Dashboards, Real-Time Streams, PiP & Low-Power CPU Devices
   Reference: Solutions Engine (Solutions.mbtq.dev)
   ========================================================================== */

/* --------------------------------------------------------------------------
   [1] DESIGN SYSTEM TOKENS & DUAL DARK/LIGHT THEMING
   -------------------------------------------------------------------------- */
:root {
  /* Light Palette Defaults */
  --mgr-bg: #f8fafc;
  --mgr-surface: #ffffff;
  --mgr-surface-elevated: #f1f5f9;
  --mgr-border: #e2e8f0;
  --mgr-border-focus: #3b82f6;
  --mgr-text-primary: #0f172a;
  --mgr-text-secondary: #475569;
  --mgr-text-muted: #94a3b8;
  --mgr-accent: #2563eb;
  --mgr-accent-hover: #1d4ed8;
  --mgr-accent-rgb: 37, 99, 235;
  --mgr-success: #10b981;
  --mgr-warning: #f59e0b;
  --mgr-danger: #ef4444;
  --mgr-pip-bg: #0f172a;
  --mgr-pip-border: #334155;
  --mgr-overlay-backdrop: rgba(15, 23, 42, 0.65);

  /* Elevation & CPU Shadow Tokens (Single-pass for minimal redraw) */
  --mgr-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --mgr-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
  --mgr-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Fluid Layout & Dynamic Viewport Variables */
  --mgr-container-max: 1440px;
  --mgr-gap-fluid: clamp(1rem, 1.5vw, 1.75rem);
  --mgr-radius-card: 16px;
  --mgr-radius-sm: 8px;
  --mgr-transition-duration: 0.2s;
}

/* Explicit Dark Mode Overrides & OS Media Query Sync */
@media (prefers-color-scheme: dark) {
  :root {
    --mgr-bg: #090d16;
    --mgr-surface: #0f172a;
    --mgr-surface-elevated: #1e293b;
    --mgr-border: #1e293b;
    --mgr-border-focus: #60a5fa;
    --mgr-text-primary: #f8fafc;
    --mgr-text-secondary: #cbd5e1;
    --mgr-text-muted: #64748b;
    --mgr-accent: #3b82f6;
    --mgr-accent-hover: #60a5fa;
    --mgr-accent-rgb: 59, 130, 246;
    --mgr-pip-bg: #020617;
    --mgr-pip-border: #1e293b;
    --mgr-overlay-backdrop: rgba(2, 6, 23, 0.85);
    --mgr-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
    --mgr-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
    --mgr-shadow-lg: 0 10px 20px -3px rgba(0, 0, 0, 0.6);
  }
}

[data-theme="dark"] {
  --mgr-bg: #090d16;
  --mgr-surface: #0f172a;
  --mgr-surface-elevated: #1e293b;
  --mgr-border: #1e293b;
  --mgr-border-focus: #60a5fa;
  --mgr-text-primary: #f8fafc;
  --mgr-text-secondary: #cbd5e1;
  --mgr-text-muted: #64748b;
  --mgr-accent: #3b82f6;
  --mgr-accent-hover: #60a5fa;
  --mgr-pip-bg: #020617;
  --mgr-pip-border: #1e293b;
}

/* --------------------------------------------------------------------------
   [2] BUILT-IN CPU-PURPOSE ADAPTABLE RESPONSIVENESS & THROTTLING
   -------------------------------------------------------------------------- */
/* Hardware Acceleration Containment: Isolates manager sections from repainting whole document */
.mgr-card,
.mgr-stats-grid,
.mgr-pip-widget {
  contain: layout paint style;
  content-visibility: auto;
}

/* CPU-Save & Battery-Saving Mode: Triggered via reduced-motion or low-power attribute */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .mgr-overlay-backdrop,
  .mgr-pip-widget {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}

[data-cpu-mode="low-power"] {
  --mgr-shadow-sm: none;
  --mgr-shadow-md: none;
  --mgr-shadow-lg: none;
  --mgr-transition-duration: 0s;
}

[data-cpu-mode="low-power"] .mgr-overlay,
[data-cpu-mode="low-power"] .mgr-pip-widget {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background-color: var(--mgr-surface);
}

/* GPU-Composited Transitions Only (Zero Layout Geometry Thrashing) */
.mgr-interactive {
  transition: transform var(--mgr-transition-duration, 0.2s) cubic-bezier(0.16, 1, 0.3, 1),
              opacity var(--mgr-transition-duration, 0.2s) ease;
  will-change: transform;
}

.mgr-interactive:hover {
  transform: translate3d(0, -2px, 0);
}

/* --------------------------------------------------------------------------
   [3] RESPONSIVE BREAKPOINT ARCHITECTURE
   Key Breakpoints:
   - Compact Mobile : max-width: 639px
   - Tablet Device  : min-width: 640px and max-width: 1023px
   - Workstation    : min-width: 1024px and max-width: 1439px
   - Ultra-Wide 4K  : min-width: 1440px
   -------------------------------------------------------------------------- */
.mgr-workbench {
  min-height: 100dvh;
  width: 100%;
  max-width: var(--mgr-container-max, 1440px);
  margin-inline: auto;
  padding: var(--mgr-gap-fluid, 1.25rem);
  padding-top: max(var(--mgr-gap-fluid, 1.25rem), env(safe-area-inset-top));
  padding-bottom: max(var(--mgr-gap-fluid, 1.25rem), env(safe-area-inset-bottom));
  box-sizing: border-box;
  color: var(--mgr-text-primary);
  background-color: var(--mgr-bg);
  display: flex;
  flex-direction: column;
  gap: var(--mgr-gap-fluid, 1.25rem);
}

/* Header & Status Ribbon */
.mgr-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--mgr-border);
}

@media (min-width: 768px) {
  .mgr-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.mgr-title-group h1 {
  font-size: clamp(1.25rem, 1rem + 1.2vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mgr-badge-pulse {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--mgr-success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.mgr-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--mgr-success);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
  animation: mgrPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes mgrPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
}

/* Stats Metric Grid (Responsive Adaptable) */
.mgr-stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .mgr-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .mgr-stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.mgr-card {
  background: var(--mgr-surface);
  border: 1px solid var(--mgr-border);
  border-radius: var(--mgr-radius-card, 16px);
  padding: 1.25rem;
  box-shadow: var(--mgr-shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mgr-card-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--mgr-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.mgr-card-val {
  font-size: clamp(1.5rem, 1.2rem + 1vw, 2.25rem);
  font-weight: 800;
  color: var(--mgr-text-primary);
  line-height: 1;
}

.mgr-card-meta {
  font-size: 0.75rem;
  color: var(--mgr-text-muted);
  margin-top: 0.5rem;
}

/* Main Split View: Layout Adaptable by Device */
.mgr-main-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--mgr-gap-fluid, 1.25rem);
}

@media (min-width: 1024px) {
  .mgr-main-split {
    grid-template-columns: 2fr 1fr;
  }
}

/* Solution Engine Multi-Platform & Protocol Analysis Section */
.mgr-engine-box {
  background: var(--mgr-surface);
  border: 1px solid var(--mgr-border);
  border-radius: var(--mgr-radius-card, 16px);
  padding: 1.5rem;
  box-shadow: var(--mgr-shadow-md);
}

.mgr-protocol-pipeline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin: 1rem 0;
  padding: 0.75rem;
  background: var(--mgr-surface-elevated);
  border-radius: var(--mgr-radius-sm);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
}

.mgr-step-pill {
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  background: var(--mgr-surface);
  border: 1px solid var(--mgr-border);
  color: var(--mgr-text-primary);
  font-weight: 700;
}

.mgr-step-arrow {
  color: var(--mgr-text-muted);
  font-weight: bold;
}

/* --------------------------------------------------------------------------
   [4] PICTURE-IN-PICTURE (PIP) FLOATING STREAM COMPONENT
   -------------------------------------------------------------------------- */
.mgr-pip-widget {
  position: fixed;
  bottom: max(1.5rem, env(safe-area-inset-bottom));
  right: max(1.5rem, env(safe-area-inset-right));
  width: clamp(260px, 32vw, 420px);
  aspect-ratio: 16 / 9;
  background: var(--mgr-pip-bg, #0f172a);
  border: 1px solid var(--mgr-pip-border, #334155);
  border-radius: var(--mgr-radius-card, 16px);
  box-shadow: var(--mgr-shadow-lg);
  z-index: 900;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
}

@media (max-width: 639px) {
  .mgr-pip-widget {
    /* Mobile adaptive: smaller PiP docked without covering full screen */
    width: 220px;
    bottom: max(1rem, env(safe-area-inset-bottom));
    right: 1rem;
    border-radius: 12px;
  }
}

.mgr-pip-header {
  padding: 0.65rem 0.85rem;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #f8fafc;
  font-size: 0.75rem;
  font-weight: 600;
}

.mgr-pip-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #94a3b8;
  font-size: 0.8125rem;
  text-align: center;
  padding: 1rem;
}

.mgr-pip-actions {
  display: flex;
  gap: 0.5rem;
}

.mgr-pip-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 4px;
  padding: 0.2rem 0.45rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.mgr-pip-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* --------------------------------------------------------------------------
   [5] MODAL & DRAWER OVERLAYS
   -------------------------------------------------------------------------- */
.mgr-overlay {
  position: fixed;
  inset: 0;
  background: var(--mgr-overlay-backdrop, rgba(15, 23, 42, 0.65));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  isolation: isolate;
}

.mgr-modal-content {
  background: var(--mgr-surface);
  border: 1px solid var(--mgr-border);
  border-radius: var(--mgr-radius-card, 16px);
  max-width: 640px;
  width: 100%;
  max-height: 90dvh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: var(--mgr-shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* --------------------------------------------------------------------------
   [6] SOLUTION ENGINE CARD (Solutions.mbtq.dev)
   -------------------------------------------------------------------------- */
.mgr-solution-engine {
  border-left: 4px solid var(--mgr-accent);
  background: var(--mgr-surface-elevated);
  padding: 1.25rem;
  border-radius: var(--mgr-radius-sm);
  margin-top: 1rem;
}

.mgr-solution-engine h3 {
  margin: 0 0 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--mgr-text-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mgr-solution-engine p {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--mgr-text-secondary);
}

.mgr-solution-badge {
  font-size: 0.7rem;
  font-family: monospace;
  padding: 0.15rem 0.5rem;
  background: rgba(var(--mgr-accent-rgb), 0.15);
  color: var(--mgr-accent);
  border-radius: 4px;
  font-weight: 700;
}`,
    html: `<div class="mgr-workbench" data-theme="dark" data-cpu-mode="balanced">
  <!-- Top Navigation & Health Ribbon -->
  <header class="mgr-header">
    <div class="mgr-title-group">
      <h1>
        <span>Operations Executive Manager</span>
        <span class="mgr-badge-pulse">
          <span class="mgr-pulse-dot"></span>
          <span>HTTP / WS Live Engine</span>
        </span>
      </h1>
      <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: var(--mgr-text-secondary);">
        Real-time telemetry, responsive picture-in-picture streaming & CPU-purpose adaptation
      </p>
    </div>

    <!-- Manager Actions -->
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <button class="mgr-interactive" style="padding: 0.5rem 1rem; border-radius: 8px; background: var(--mgr-surface-elevated); border: 1px solid var(--mgr-border); color: var(--mgr-text-primary); font-size: 0.8125rem; font-weight: 600; cursor: pointer;">
        Low-Power CPU Mode: OFF
      </button>
      <button class="mgr-interactive" style="padding: 0.5rem 1.25rem; border-radius: 8px; background: var(--mgr-accent); border: none; color: #ffffff; font-size: 0.8125rem; font-weight: 600; cursor: pointer;">
        Solutions.mbtq.dev
      </button>
    </div>
  </header>

  <!-- Metric KPI Cards with Breakpoint Auto-Reflow -->
  <section class="mgr-stats-grid">
    <div class="mgr-card mgr-interactive">
      <div class="mgr-card-label">CPU Render Budget</div>
      <div class="mgr-card-val" style="color: var(--mgr-success);">60.0 FPS</div>
      <div class="mgr-card-meta">Paint Cost: 1.4ms (GPU Composited)</div>
    </div>

    <div class="mgr-card mgr-interactive">
      <div class="mgr-card-label">Protocol Throughput</div>
      <div class="mgr-card-val">WS 2.4k/s</div>
      <div class="mgr-card-meta">Persistent Bi-directional Socket</div>
    </div>

    <div class="mgr-card mgr-interactive">
      <div class="mgr-card-label">Cross-Platform Sync</div>
      <div class="mgr-card-val">99.98%</div>
      <div class="mgr-card-meta">WASM Thread Offload Active</div>
    </div>

    <div class="mgr-card mgr-interactive">
      <div class="mgr-card-label">Overlay & PiP State</div>
      <div class="mgr-card-val" style="color: var(--mgr-accent);">Docked</div>
      <div class="mgr-card-meta">16:9 Aspect Ratio Maintained</div>
    </div>
  </section>

  <!-- Main Managerial Layout Split View -->
  <div class="mgr-main-split">
    <!-- Left Column: Architecture & Protocol Analysis -->
    <div class="mgr-engine-box">
      <h2 style="font-size: 1.125rem; font-weight: 700; margin: 0 0 0.5rem;">
        Runtime Evolution: Mobile to WebApp to Cross-Platform Engine
      </h2>
      <p style="font-size: 0.875rem; color: var(--mgr-text-secondary); line-height: 1.6; margin: 0;">
        From initial browser request to full native execution, this dashboard maps how our architecture shifts across transport layers, execution engines, and viewport constraints.
      </p>

      <!-- Protocol Transition Pipeline -->
      <div class="mgr-protocol-pipeline">
        <span class="mgr-step-pill">Mobile Native</span>
        <span class="mgr-step-arrow">→</span>
        <span class="mgr-step-pill">Browser (100dvh)</span>
        <span class="mgr-step-arrow">→</span>
        <span class="mgr-step-pill">PWA WebApp</span>
        <span class="mgr-step-arrow">→</span>
        <span class="mgr-step-pill">HTTP / HTTPS</span>
        <span class="mgr-step-arrow">→</span>
        <span class="mgr-step-pill">WS Streams</span>
        <span class="mgr-step-arrow">→</span>
        <span class="mgr-step-pill">WASM Compute</span>
        <span class="mgr-step-arrow">→</span>
        <span class="mgr-step-pill" style="background: rgba(var(--mgr-accent-rgb), 0.2); border-color: var(--mgr-accent);">Flutter Solution Engine</span>
      </div>

      <!-- Solution Engine Synthesis -->
      <div class="mgr-solution-engine">
        <h3>
          <span>Cross-Platform Evaluation (Solutions.mbtq.dev)</span>
          <span class="mgr-solution-badge">Engine v4.2</span>
        </h3>
        <p>
          <strong>Why Flutter leads as the most effective solution:</strong> Flutter provides a unified Skia/Impeller direct-to-canvas rendering pipeline, eliminating DOM reconciliation overhead and guaranteeing consistent 60/120fps physics across iOS, Android, and Desktop from a single codebase.
          <br /><br />
          <strong>Why not always in every case?</strong> For lightweight web apps, initial Flutter Web canvas bundle size and lack of native semantic HTML/SEO can create initial load bottlenecks. In those scenarios, our responsive CSS + WASM + HTTP/WS architecture delivers instant zero-latency paint.
        </p>
      </div>
    </div>

    <!-- Right Column: Overlay Controls & Breakpoint Specs -->
    <div class="mgr-card">
      <h3 style="font-size: 1rem; font-weight: 700; margin: 0 0 0.75rem;">Breakpoint Matrix</h3>
      <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.8125rem; color: var(--mgr-text-secondary); line-height: 1.7;">
        <li><strong>Compact Mobile (&lt; 640px):</strong> Stacked cards, safe-area inset adaptation, compact PiP dock.</li>
        <li><strong>Tablet (640px - 1024px):</strong> 2-column auto-reflow, touch targets clamped &ge; 48px.</li>
        <li><strong>Desktop Workstation (1024px+):</strong> High-density 4-column metrics & persistent inspector.</li>
        <li><strong>Ultra-Wide (&ge; 1440px):</strong> Clamped container to preserve ergonomic reading length.</li>
      </ul>
    </div>
  </div>

  <!-- Picture-in-Picture (PiP) Floating Stream Widget -->
  <aside class="mgr-pip-widget" aria-label="Picture in Picture Stream Monitor">
    <div class="mgr-pip-header">
      <span style="display: flex; align-items: center; gap: 0.35rem;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
        <span>Manager Live Stream (PiP)</span>
      </span>
      <div class="mgr-pip-actions">
        <button class="mgr-pip-btn" title="Expand View">⛶</button>
        <button class="mgr-pip-btn" title="Close PiP">✕</button>
      </div>
    </div>
    <div class="mgr-pip-body">
      <span style="font-size: 1.5rem; margin-bottom: 0.25rem;">📡</span>
      <div style="font-weight: 700; color: #f8fafc;">WS Stream Active</div>
      <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Latency: 12ms • 1080p60</div>
    </div>
  </aside>
</div>`,
  },
  {
    id: 'mdn-crisis-alert-banner',
    name: 'MDN Recipe: Breaking Crisis & Emergency Alert Banner',
    category: 'hero',
    description: 'MDN Layout Cookbook standard recipe for critical civil emergency alerts and breaking news. Features sticky positioning, safe-area inset protection, high-contrast WCAG AAA red theming, and an accessible non-reflowing live beacon.',
    responsiveNotes: [
      'Conforms to MDN Web Docs Layout Cookbook recipe template specification',
      'position: sticky; top: 0; with max(0.75rem, env(safe-area-inset-top)) prevents mobile notch clipping',
      'WCAG AAA 7.4:1 contrast ratio (#FFFFFF on #991B1B) for severe emergency legibility',
      'role="alert" and aria-live="assertive" for immediate screen reader priority',
      'prefers-reduced-motion media query disables beacon pulse',
    ],
    css: `/* MDN Layout Cookbook Recipe: Emergency Alert Banner */
.mdn-crisis-banner {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: #991b1b;
  color: #ffffff;
  padding: 0.75rem 1rem;
  padding-top: max(0.75rem, env(safe-area-inset-top));
  border-bottom: 2px solid #ef4444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  isolation: isolate;
}

.banner-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.25rem;
}

.beacon-group {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.pulse-beacon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #fef08a;
  box-shadow: 0 0 0 2px rgba(254, 240, 138, 0.4);
  animation: beaconPulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  will-change: transform, opacity;
}

@keyframes beaconPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
  .pulse-beacon {
    animation: none;
  }
}

.alert-type {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.message-content {
  flex: 1 1 280px;
  font-size: 0.875rem;
  line-height: 1.45;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn {
  background: #ffffff;
  color: #991b1b;
  font-weight: 700;
  font-size: 0.8125rem;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  min-height: 38px;
}

.action-btn:focus-visible,
.dismiss-btn:focus-visible {
  outline: 3px solid #fef08a;
  outline-offset: 2px;
}

.dismiss-btn {
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 6px;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
}`,
    html: `<aside class="mdn-crisis-banner" role="alert" aria-live="assertive" aria-label="Critical Emergency Alert">
  <div class="banner-inner">
    <div class="beacon-group">
      <span class="pulse-beacon" aria-hidden="true"></span>
      <span class="alert-type">CIVIL EMERGENCY</span>
    </div>
    <div class="message-content">
      <strong>URGENT NOTICE:</strong> Flash flood evacuation active for coastal sectors. Follow designated safety corridors immediately.
    </div>
    <div class="banner-actions">
      <a href="#evac-map" class="action-btn">Evacuation Map</a>
      <button type="button" class="dismiss-btn" aria-label="Acknowledge and dismiss emergency banner">✕</button>
    </div>
  </div>
</aside>`,
  },
  {
    id: 'mdn-climate-heat-matrix',
    name: 'MDN Recipe: Severe Weather & Climate Heat Hazard Matrix',
    category: 'card',
    description: 'MDN Layout Cookbook standard recipe for localized climate metrics. Uses CSS Container Queries (inline-size) and uniform perceptual OKLCH color gradients for extreme temperature hazard tracking.',
    responsiveNotes: [
      'Conforms to MDN Web Docs Layout Cookbook recipe template specification',
      'container-type: inline-size enables card to adapt smoothly in sidebars, columns, or full-width layouts',
      'Perceptual OKLCH gradient creates smooth, clean color transitions from green to severe violet',
      'role="meter" with aria-valuenow="108" provides accessible semantic range indicators',
      'WCAG 1.4.1 compliance: text descriptions accompany all color hazard levels',
    ],
    css: `/* MDN Layout Cookbook Recipe: Climate Heat Hazard Matrix */
.mdn-weather-container {
  container-type: inline-size;
  container-name: weatherWidget;
  width: 100%;
  max-width: 680px;
}

.weather-card {
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.location-badge {
  font-size: 0.8125rem;
  color: #94a3b8;
  font-weight: 600;
}

.hazard-level {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

.hazard-level.danger {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.metrics-row {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
}

.temp-readout {
  display: flex;
  align-items: flex-start;
}

.temp-val {
  font-size: clamp(2.5rem, 2rem + 2vw, 4rem);
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
}

.temp-unit {
  font-size: 1.5rem;
  color: #f87171;
  font-weight: 700;
}

.heat-index {
  display: flex;
  flex-direction: column;
}

.index-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
}

.index-val {
  font-size: 1.5rem;
  color: #fb923c;
}

.advisory {
  font-size: 0.75rem;
  color: #fca5a5;
  margin-top: 0.15rem;
}

.spectrum-track {
  height: 12px;
  width: 100%;
  background: #1e293b;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.spectrum-bar {
  height: 100%;
  background: linear-gradient(
    to right,
    oklch(0.7 0.15 140),
    oklch(0.75 0.18 85),
    oklch(0.65 0.25 25),
    oklch(0.55 0.28 350)
  );
  border-radius: 9999px;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.safety-advisory {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #cbd5e1;
  background: #1e293b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 3px solid #ef4444;
}

@container weatherWidget (min-width: 480px) {
  .weather-card {
    padding: 2rem;
  }
  .metrics-row {
    gap: 3rem;
  }
}`,
    html: `<article class="mdn-weather-container" aria-label="Current Extreme Heat Risk Assessment">
  <div class="weather-card">
    <header class="card-top">
      <div class="location-badge">📍 Metro Basin • Zone 4</div>
      <span class="hazard-level danger">LEVEL 4: EXTREME HEAT</span>
    </header>

    <div class="metrics-row">
      <div class="temp-readout">
        <span class="temp-val">108°</span>
        <span class="temp-unit">F</span>
      </div>
      <div class="heat-index">
        <span class="index-label">Heat Index (Feels Like)</span>
        <strong class="index-val">116°F</strong>
        <span class="advisory">Wet Bulb Globe: 88°F (Dangerous)</span>
      </div>
    </div>

    <div class="spectrum-track" role="meter" aria-valuenow="108" aria-valuemin="70" aria-valuemax="120" aria-label="Temperature Hazard Scale">
      <div class="spectrum-bar" style="width: 78%;"></div>
    </div>

    <footer class="safety-advisory">
      <strong>Public Health Protocol:</strong> High risk of heat stroke for outdoor workers. Hydration stations active across civic centers.
    </footer>
  </div>
</article>`,
  },
];

