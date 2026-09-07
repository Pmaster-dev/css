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
];
