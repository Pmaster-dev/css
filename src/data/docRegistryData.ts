/**
 * Documentation Providers & Open Registry Registry Blocks
 * Includes MDN Web Docs, W3C Standards (CSS4/HTML5), WHATWG DOM Process, and GitHub UI Blocks.
 */

export type DocProvider = 'mdn' | 'w3c' | 'github' | 'whatwg';

export interface DocRegistryEntry {
  id: string;
  provider: DocProvider;
  title: string;
  specLevel: 'CSS4' | 'HTML5' | 'DOM Living Standard' | 'WCAG 2.2' | 'Registry Block';
  endpoint: string;
  description: string;
  status: 'Living Standard' | 'W3C Candidate' | 'Baseline 2024+' | 'Production Registry';
  syntaxExample: string;
  domProcessingSnippet?: {
    html: string;
    css: string;
  };
  sanitizerNotes?: string;
  compatibility: {
    chrome: string;
    safari: string;
    firefox: string;
    edge: string;
  };
  externalUrl: string;
}

export const DOC_REGISTRY_ENTRIES: DocRegistryEntry[] = [
  {
    id: 'dom-sethtml-sanitizer',
    provider: 'whatwg',
    title: 'Element.prototype.setHTML() [HTML Sanitizer API]',
    specLevel: 'DOM Living Standard',
    endpoint: '/api/docs/whatwg/dom/sethtml',
    description: 'Safely parses an untrusted HTML string into the DOM using the browser native Sanitizer API, stripping <script>, javascript: protocol, and malicious event handlers without XSS risk.',
    status: 'Living Standard',
    syntaxExample: `// Modern safe alternative to innerHTML:
const sanitizer = new Sanitizer({
  allowElements: ['div', 'span', 'p', 'b', 'i', 'article', 'section'],
  dropAttributes: { 'onclick': ['*'], 'onerror': ['*'] }
});

element.setHTML(untrustedHtmlString, { sanitizer });`,
    domProcessingSnippet: {
      html: `<article class="sanitized-card" data-security="verified">
  <header class="card-header">
    <span class="badge-safe">setHTML() Verified Node</span>
    <h3 class="card-title">Sanitized DOM Tree Mount</h3>
  </header>
  <p class="card-body">
    This element was parsed and mounted into the document object model via the <strong>HTML Sanitizer API</strong>.
    Dangerous tags (such as <code>&lt;script&gt;</code> or inline execution traps) are neutralized automatically at parse time.
  </p>
  <div class="card-actions">
    <button class="safe-btn" type="button">Safe Action Trigger</button>
  </div>
</article>`,
      css: `.sanitized-card {
  background: var(--surface-color, #0f172a);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  color: #f8fafc;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.badge-safe {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-top: 0.75rem;
  color: #ffffff;
}

.card-body {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.safe-btn {
  margin-top: 1.25rem;
  padding: 0.6rem 1.25rem;
  background: #10b981;
  color: #ffffff;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s ease;
}

.safe-btn:hover {
  opacity: 0.9;
}`
    },
    sanitizerNotes: 'Drops <script>, <iframe>, <object>, and inline event listeners (onerror, onload). Only safe semantic markup is bound to the document tree.',
    compatibility: {
      chrome: '105+',
      safari: '18+',
      firefox: '128+ (Behind Flag)',
      edge: '105+'
    },
    externalUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML'
  },
  {
    id: 'css4-subgrid',
    provider: 'w3c',
    title: 'CSS Grid Level 2: subgrid',
    specLevel: 'CSS4',
    endpoint: '/api/docs/w3c/css/grid-subgrid',
    description: 'Allows child grid items to inherit the track definition (columns and rows) of their parent grid container, keeping cards in multi-column rows vertically and horizontally aligned.',
    status: 'Baseline 2024+',
    syntaxExample: `.parent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-template-rows: auto auto auto;
  gap: 1.5rem;
}

.grid-card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* Inherits row tracks perfectly */
}`,
    domProcessingSnippet: {
      html: `<div class="subgrid-showcase">
  <div class="subgrid-card">
    <h3 class="subgrid-head">Short Title</h3>
    <p class="subgrid-desc">Card with short content that aligns seamlessly with sibling cards.</p>
    <footer class="subgrid-foot"><button class="subgrid-btn">Explore</button></footer>
  </div>
  <div class="subgrid-card">
    <h3 class="subgrid-head">Longer Comprehensive Multi-line Heading</h3>
    <p class="subgrid-desc">Notice how despite varying text heights, the footer buttons remain exactly level along the subgrid baseline.</p>
    <footer class="subgrid-foot"><button class="subgrid-btn">Explore</button></footer>
  </div>
</div>`,
      css: `.subgrid-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  grid-template-rows: auto 1fr auto;
  gap: 1.5rem;
  width: 100%;
}

.subgrid-card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #334155;
}

.subgrid-head {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
}

.subgrid-desc {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0.5rem 0;
}

.subgrid-foot {
  display: flex;
  align-items: center;
}

.subgrid-btn {
  width: 100%;
  padding: 0.6rem 1rem;
  background: #2563eb;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  border: none;
}`
    },
    sanitizerNotes: 'Inherits layout without DOM wrapper inflation, eliminating duplicate heights.',
    compatibility: {
      chrome: '117+',
      safari: '16.0+',
      firefox: '71+',
      edge: '117+'
    },
    externalUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid'
  },
  {
    id: 'css4-color-mix',
    provider: 'w3c',
    title: 'CSS Color Module Level 4: color-mix() & OKLCH',
    specLevel: 'CSS4',
    endpoint: '/api/docs/w3c/css/color-mix',
    description: 'Enables mathematical color interpolation in perceptual color spaces (OKLCH / Lab) directly in CSS without Sass/PostCSS preprocessors.',
    status: 'Baseline 2024+',
    syntaxExample: `/* Mix brand blue with 20% transparent in perceptual OKLCH */
--surface-tinted: color-mix(in oklch, var(--brand-blue) 80%, transparent);
--button-hover: color-mix(in srgb, #2563eb 85%, #000000 15%);`,
    domProcessingSnippet: {
      html: `<div class="color-mix-panel">
  <div class="swatch oklch-1">Base OKLCH 100%</div>
  <div class="swatch oklch-2">color-mix(in oklch, blue 70%, white)</div>
  <div class="swatch oklch-3">color-mix(in oklch, blue 40%, transparent)</div>
</div>`,
      css: `.color-mix-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.swatch {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.oklch-1 {
  background: oklch(0.6 0.2 250);
  color: #ffffff;
}

.oklch-2 {
  background: color-mix(in oklch, oklch(0.6 0.2 250) 70%, #ffffff);
  color: #0f172a;
}

.oklch-3 {
  background: color-mix(in oklch, oklch(0.6 0.2 250) 40%, transparent);
  color: #ffffff;
  backdrop-filter: blur(8px);
}`
    },
    sanitizerNotes: 'Eliminates banding artifacts in gray and vibrant transition blends.',
    compatibility: {
      chrome: '111+',
      safari: '16.2+',
      firefox: '113+',
      edge: '111+'
    },
    externalUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix'
  },
  {
    id: 'css4-has-selector',
    provider: 'mdn',
    title: 'CSS Selectors Level 4: :has() Relational Selector',
    specLevel: 'CSS4',
    endpoint: '/api/docs/mdn/css/has-selector',
    description: 'The parent selector in CSS. Selects elements based on their descendants, adjacent siblings, or form validation states without JavaScript DOM mutation listeners.',
    status: 'Baseline 2024+',
    syntaxExample: `/* Style card if it contains a featured badge */
.card:has(.badge-featured) {
  border-color: #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.25);
}

/* Style form group when input inside is invalid */
.form-field:has(input:invalid:not(:placeholder-shown)) {
  border-left: 3px solid #ef4444;
}`,
    domProcessingSnippet: {
      html: `<div class="has-card-demo">
  <div class="interactive-card">
    <div class="card-head">
      <span class="badge-featured">★ Featured Pick</span>
    </div>
    <h4>Parent Responds to Descendant</h4>
    <p>Notice the glowing amber border applied entirely via <code>:has(.badge-featured)</code> with zero JS.</p>
  </div>
</div>`,
      css: `.has-card-demo {
  width: 100%;
}

.interactive-card {
  padding: 1.5rem;
  border-radius: 16px;
  background: #1e293b;
  border: 1px solid #334155;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.interactive-card:has(.badge-featured) {
  border-color: #f59e0b;
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.2);
}

.badge-featured {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  background: #f59e0b;
  color: #000;
  font-size: 0.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}`
    },
    sanitizerNotes: 'Replaces mutation observers and JS DOM class toggling with zero script execution.',
    compatibility: {
      chrome: '105+',
      safari: '15.4+',
      firefox: '121+',
      edge: '105+'
    },
    externalUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:has'
  },
  {
    id: 'github-bento-grid-block',
    provider: 'github',
    title: 'Open Registry: Accessible Responsive Bento Grid Block',
    specLevel: 'Registry Block',
    endpoint: '/api/docs/github/blocks/bento-grid',
    description: 'An asymmetrical, container-query adaptive bento layout for dashboard interfaces that collapses smoothly from 4 columns to 1 column without breakpoint media queries.',
    status: 'Production Registry',
    syntaxExample: `<!-- GitHub Block Registry Template -->
<div class="bento-container">
  <article class="bento-hero">Hero Metric</article>
  <article class="bento-item">Widget 1</article>
  <article class="bento-item">Widget 2</article>
</div>`,
    domProcessingSnippet: {
      html: `<section class="bento-grid" aria-label="Feature Matrix">
  <div class="bento-tile bento-span-2">
    <span class="bento-tag">Primary Metric</span>
    <h3 class="bento-val">99.98%</h3>
    <p class="bento-caption">Hardware-accelerated frame consistency</p>
  </div>
  <div class="bento-tile">
    <span class="bento-tag">Memory</span>
    <h3 class="bento-val">12 MB</h3>
    <p class="bento-caption">Zero-jank heap footprint</p>
  </div>
  <div class="bento-tile">
    <span class="bento-tag">WCAG 2.2</span>
    <h3 class="bento-val">AAA</h3>
    <p class="bento-caption">Passes 7.0:1 contrast rules</p>
  </div>
</section>`,
      css: `.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 1rem;
  width: 100%;
}

@media (min-width: 640px) {
  .bento-span-2 {
    grid-column: span 2;
  }
}

.bento-tile {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bento-tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.bento-val {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0.5rem 0;
}

.bento-caption {
  font-size: 0.8rem;
  color: #64748b;
}`
    },
    sanitizerNotes: 'Built for semantic HTML5 sectioning and fluid multi-breakpoint scaling.',
    compatibility: {
      chrome: 'Full',
      safari: 'Full',
      firefox: 'Full',
      edge: 'Full'
    },
    externalUrl: 'https://github.com/topics/css-blocks'
  },
  {
    id: 'github-hypermedia-captions-block',
    provider: 'github',
    title: 'Open Registry: Accessible Video & Track DOM Block',
    specLevel: 'Registry Block',
    endpoint: '/api/docs/github/blocks/accessible-media-track',
    description: 'WCAG-compliant HTML5 video player block with synchronized WebVTT captions (<track>), custom styling via ::cue, and fallback audio description live regions.',
    status: 'Production Registry',
    syntaxExample: `<video controls playsinline class="adaptive-media">
  <source src="video.mp4" type="video/mp4" />
  <track kind="captions" src="captions.vtt" srclang="en" label="English" default />
</video>`,
    domProcessingSnippet: {
      html: `<figure class="hypermedia-container">
  <div class="video-mockup">
    <div class="video-overlay-cue">
      <span class="vtt-badge">WebVTT ::cue</span>
      <p class="cue-text">[Narrator speaking clearly with synchronized high-contrast captions]</p>
    </div>
  </div>
  <figcaption class="hypermedia-caption">
    <strong>Accessible Media Container:</strong> Uses HTML5 <code>&lt;track kind="captions"&gt;</code> and CSS <code>::cue</code> for hard-of-hearing visual synchrony.
  </figcaption>
</figure>`,
      css: `.hypermedia-container {
  width: 100%;
  margin: 0;
  border-radius: 16px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid #334155;
}

.video-mockup {
  aspect-ratio: 16 / 9;
  background: radial-gradient(circle at center, #1e293b, #090d16);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem;
}

.video-overlay-cue {
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  text-align: center;
  max-width: 90%;
}

.vtt-badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-mono;
  color: #38bdf8;
  font-weight: 700;
  display: block;
  margin-bottom: 0.25rem;
}

.cue-text {
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}

.hypermedia-caption {
  padding: 1rem;
  font-size: 0.8rem;
  color: #94a3b8;
  border-top: 1px solid #1e293b;
}`
    },
    sanitizerNotes: 'Provides accessible media playback with high-contrast text overlays and zero layout shift.',
    compatibility: {
      chrome: 'Full',
      safari: 'Full',
      firefox: 'Full',
      edge: 'Full'
    },
    externalUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track'
  }
];

/**
 * MDN Layout Cookbook Recipe Specification
 * Conforms to MDN Web Docs official recipe format:
 * https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Contribute_a_recipe/Cookbook_template
 *
 * Structure:
 * 1. Title & Summary
 * 2. The Solution (HTML + CSS)
 * 3. How It Works (Detailed layout breakdown)
 * 4. Browser Support & Fallbacks (@supports, Baseline)
 * 5. Accessibility Concerns (WCAG 2.1 AA/AAA, screen readers, focus, reduced-motion)
 * 6. Alternatives (Architectural tradeoffs)
 */

export interface MdnCookbookRecipe {
  id: string;
  title: string;
  topic: 'crisis' | 'climate' | 'civic' | 'infrastructure' | 'humanitarian';
  topicLabel: string;
  summary: string;
  mdnTemplateRef: string;
  solution: {
    html: string;
    css: string;
  };
  howItWorks: {
    property: string;
    explanation: string;
  }[];
  browserSupport: {
    baseline: string;
    safari: string;
    chrome: string;
    firefox: string;
    fallbacks: string;
  };
  accessibilityConcerns: {
    rule: string;
    guideline: string;
    implementation: string;
  }[];
  alternatives: {
    approach: string;
    tradeoff: string;
  }[];
}

export const MDN_COOKBOOK_RECIPES: MdnCookbookRecipe[] = [
  {
    id: 'recipe-crisis-alert',
    title: 'Breaking Crisis & Emergency Alert Banner',
    topic: 'crisis',
    topicLabel: 'Crisis & Public Safety',
    summary: 'A persistent, accessible, non-layout-shifting emergency ribbon designed for breaking news, severe civil alerts, and emergency notifications. Uses sticky positioning, safe-area inset adaptation, and a GPU-pulsing live beacon without triggering continuous document layout thrashing.',
    mdnTemplateRef: 'https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Contribute_a_recipe/Cookbook_template',
    solution: {
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
      css: `/* MDN Layout Cookbook Recipe: Emergency Alert Banner */
.mdn-crisis-banner {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: #991b1b; /* High-contrast red (WCAG AAA 7.4:1 contrast ratio) */
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
}`
    },
    howItWorks: [
      {
        property: 'position: sticky & top: 0',
        explanation: 'Keeps the urgent alert anchored to the top of the viewport during document scrolling without removing it from the natural document flow, preventing jarring Cumulative Layout Shift (CLS).'
      },
      {
        property: 'padding-top: max(..., env(safe-area-inset-top))',
        explanation: 'Ensures the text is not occluded by physical mobile screen notches, dynamic islands, or browser status bars.'
      },
      {
        property: 'flex-wrap: wrap & flex: 1 1 280px',
        explanation: 'Allows the message text to expand fluidly on wide desktop monitors while gracefully wrapping below the alert title on narrow smartphones.'
      },
      {
        property: 'isolation: isolate',
        explanation: 'Creates an independent stacking context so child elements and box-shadows render cleanly above third-party widgets without z-index collisions.'
      }
    ],
    browserSupport: {
      baseline: 'Widely Available (Baseline 2020)',
      safari: 'Safari 13+',
      chrome: 'Chrome 56+',
      firefox: 'Firefox 59+',
      fallbacks: 'Older browsers that do not support position: sticky degrade gracefully to standard block-level display at the top of the body.'
    },
    accessibilityConcerns: [
      {
        rule: 'role="alert" & aria-live="assertive"',
        guideline: 'WCAG 4.1.3 Status Messages',
        implementation: 'Screen readers immediately interrupt and announce critical emergency instructions upon DOM insertion.'
      },
      {
        rule: 'High-Contrast Text 7.4:1',
        guideline: 'WCAG 1.4.6 Contrast (Enhanced)',
        implementation: 'White text (#FFFFFF) on dark emergency crimson (#991B1B) exceeds both AA (4.5:1) and AAA (7:1) contrast thresholds.'
      },
      {
        rule: 'prefers-reduced-motion',
        guideline: 'WCAG 2.3.3 Animation from Interactions',
        implementation: 'Disables the pulsing beacon animation for users susceptible to vestibular distress.'
      }
    ],
    alternatives: [
      {
        approach: 'Floating Modal Dialog',
        tradeoff: 'Obscures underlying content and traps keyboard focus, which can prevent users from reading maps or accessing navigation links during an emergency.'
      },
      {
        approach: 'Bottom Floating Toast',
        tradeoff: 'Frequently hidden behind mobile software keyboards or bottom action bars; sticky top banners guarantee instant visual discovery.'
      }
    ]
  },
  {
    id: 'recipe-climate-heat',
    title: 'Severe Weather & Climate Heat Hazard Matrix',
    topic: 'climate',
    topicLabel: 'Climate & Extreme Weather',
    summary: 'A localized weather hazard index card leveraging CSS Container Queries to adapt seamlessly from a compact sidebar widget into an expanded 5-day heat-risk matrix, featuring modern perceptual OKLCH color interpolation.',
    mdnTemplateRef: 'https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Contribute_a_recipe/Cookbook_template',
    solution: {
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

    <!-- OKLCH Gradient Heat Spectrum Bar -->
    <div class="spectrum-track" role="meter" aria-valuenow="108" aria-valuemin="70" aria-valuemax="120" aria-label="Temperature Hazard Scale">
      <div class="spectrum-bar" style="width: 78%;"></div>
    </div>

    <footer class="safety-advisory">
      <strong>Public Health Protocol:</strong> High risk of heat stroke for outdoor workers. Hydration stations active across civic centers.
    </footer>
  </div>
</article>`,
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

/* OKLCH Perceptual Spectrum Bar */
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
    oklch(0.7 0.15 140), /* Green */
    oklch(0.75 0.18 85), /* Amber */
    oklch(0.65 0.25 25), /* Vivid Red */
    oklch(0.55 0.28 350) /* Deep Violet Extreme */
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

/* Container Query Adaptability */
@container weatherWidget (min-width: 480px) {
  .weather-card {
    padding: 2rem;
  }
  .metrics-row {
    gap: 3rem;
  }
}`
    },
    howItWorks: [
      {
        property: 'container-type: inline-size',
        explanation: 'Establishes a container context based on the component parent width, allowing the card to adapt dynamically whether embedded in a narrow sidebar or a full-width dashboard.'
      },
      {
        property: 'linear-gradient(to right, oklch(...))',
        explanation: 'Utilizes modern OKLCH color space for perceptual uniformity without muddy gray transitions common in legacy sRGB gradients.'
      },
      {
        property: 'role="meter" & aria-valuenow',
        explanation: 'Provides semantic accessibility markup for assistive devices to convey current temperature relative to minimum and maximum thresholds.'
      }
    ],
    browserSupport: {
      baseline: 'Baseline 2023 (Widely Available)',
      safari: 'Safari 16.0+',
      chrome: 'Chrome 105+',
      firefox: 'Firefox 110+',
      fallbacks: 'Older engines fallback to standard flexbox stacking without container query resizing.'
    },
    accessibilityConcerns: [
      {
        rule: 'WCAG 1.4.1 Use of Color',
        guideline: 'Information conveyed by color must also be available in text',
        implementation: 'Explicit text indicators ("LEVEL 4: EXTREME HEAT", "116°F Feels Like") accompany the color spectrum.'
      },
      {
        rule: 'Accessible meter semantics',
        guideline: 'ARIA Meter Specification',
        implementation: 'role="meter" informs screen reader users of numerical range and current position.'
      }
    ],
    alternatives: [
      {
        approach: 'Viewport Media Queries (@media)',
        tradeoff: 'Fails when placed inside nested multi-column layouts where viewport is wide but component width is narrow.'
      }
    ]
  },
  {
    id: 'recipe-election-ballot',
    title: 'Civic Election & Referendum Live Results Split',
    topic: 'civic',
    topicLabel: 'Civic Tech & Elections',
    summary: 'A proportional voting results visualizer allocating candidate ballot shares using CSS Grid and Flexbox proportions, complete with high-contrast colorblind-safe boundary dividers and accessible numerical data tables.',
    mdnTemplateRef: 'https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Contribute_a_recipe/Cookbook_template',
    solution: {
      html: `<section class="mdn-election-tracker" aria-labelledby="election-heading">
  <div class="election-header">
    <div>
      <span class="precinct-status">94% Precincts Reporting</span>
      <h3 id="election-heading">Mayor General Election Ballot</h3>
    </div>
    <span class="threshold-pill">50% + 1 to Avoid Runoff</span>
  </div>

  <!-- Accessible Proportional Vote Bar -->
  <div class="proportional-bar" role="progressbar" aria-valuenow="52" aria-valuemin="0" aria-valuemax="100" aria-label="Candidate A Vote Percentage">
    <div class="party-segment party-blue" style="width: 52%;" title="Candidate A: 52.4%">52.4%</div>
    <div class="party-segment party-orange" style="width: 41%;" title="Candidate B: 41.2%">41.2%</div>
    <div class="party-segment party-neutral" style="width: 7%;" title="Others: 6.4%">6.4%</div>
    <div class="threshold-marker" style="left: 50%;" aria-hidden="true" title="Majority Threshold"></div>
  </div>

  <!-- Accessible Structured Candidate Breakdown -->
  <ul class="candidate-list">
    <li class="candidate-item">
      <span class="party-dot blue"></span>
      <span class="candidate-name">Elena Rodriguez (Forward Coalition)</span>
      <span class="candidate-votes">342,109 votes</span>
      <strong class="candidate-pct">52.4%</strong>
    </li>
    <li class="candidate-item">
      <span class="party-dot orange"></span>
      <span class="candidate-name">Marcus Vance (Civic Renewal)</span>
      <span class="candidate-votes">269,142 votes</span>
      <strong class="candidate-pct">41.2%</strong>
    </li>
    <li class="candidate-item">
      <span class="party-dot gray"></span>
      <span class="candidate-name">Write-in / Uncommitted</span>
      <span class="candidate-votes">41,850 votes</span>
      <strong class="candidate-pct">6.4%</strong>
    </li>
  </ul>
</section>`,
      css: `/* MDN Layout Cookbook Recipe: Election & Referendum Results */
.mdn-election-tracker {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.5rem;
  color: #f8fafc;
  max-width: 680px;
  width: 100%;
}

.election-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.precinct-status {
  font-size: 0.75rem;
  color: #38bdf8;
  font-family: monospace;
  font-weight: 700;
  text-transform: uppercase;
}

.election-header h3 {
  margin: 0.25rem 0 0;
  font-size: 1.125rem;
  font-weight: 800;
}

.threshold-pill {
  font-size: 0.75rem;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  font-weight: 600;
}

.proportional-bar {
  display: flex;
  height: 36px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #1e293b;
  margin-bottom: 1.25rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.party-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  border-right: 1px solid #0f172a;
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  white-space: nowrap;
}

.party-blue { background: #2563eb; }
.party-orange { background: #ea580c; }
.party-neutral { background: #64748b; }

.threshold-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ffffff;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
  z-index: 2;
}

.threshold-marker::after {
  content: '50%';
  position: absolute;
  top: -18px;
  left: -12px;
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 700;
}

.candidate-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.candidate-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  background: #1e293b;
  border-radius: 8px;
  font-size: 0.8125rem;
}

.party-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.party-dot.blue { background: #2563eb; }
.party-dot.orange { background: #ea580c; }
.party-dot.gray { background: #64748b; }

.candidate-name {
  flex: 1;
  font-weight: 600;
}

.candidate-votes {
  color: #94a3b8;
  font-size: 0.75rem;
  font-family: monospace;
}

.candidate-pct {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  min-width: 44px;
  text-align: right;
}`
    },
    howItWorks: [
      {
        property: 'display: flex & width: % on segments',
        explanation: 'Creates a responsive, contiguous horizontal vote distribution bar that dynamically resizes with container width.'
      },
      {
        property: 'position: absolute on .threshold-marker',
        explanation: 'Pins the critical 50% majority threshold indicator precisely at left: 50% across any viewport width.'
      },
      {
        property: 'candidate-name { flex: 1 }',
        explanation: 'Ensures the candidate name occupies remaining space, pushing votes and percentages into a neat vertical column.'
      }
    ],
    browserSupport: {
      baseline: 'Full Cross-Browser Baseline',
      safari: 'All Versions',
      chrome: 'All Versions',
      firefox: 'All Versions',
      fallbacks: 'Supported universally across all modern and legacy rendering engines.'
    },
    accessibilityConcerns: [
      {
        rule: 'WCAG 1.4.11 Non-text Contrast',
        guideline: 'Visual boundaries must meet 3:1 contrast against adjacent colors',
        implementation: 'Dark 1px divider border between adjacent candidate segments prevents color bleeding for color-vision-deficient users.'
      },
      {
        rule: 'ARIA role="progressbar"',
        guideline: 'Screen reader numerical reporting',
        implementation: 'aria-valuenow accurately represents leading vote share for non-visual navigation.'
      }
    ],
    alternatives: [
      {
        approach: 'Canvas-Based Donut Chart',
        tradeoff: 'HTML canvas elements cannot be inspected by screen readers without extensive custom shadow DOM fallbacks.'
      }
    ]
  },
  {
    id: 'recipe-humanitarian-aid',
    title: 'Humanitarian Aid & Relief Logistics Matrix',
    topic: 'humanitarian',
    topicLabel: 'Humanitarian & Aid Logistics',
    summary: 'A multi-stakeholder crisis supply chain card using CSS Grid subgrid to keep relief milestone headers, target metrics, and donate CTAs horizontally aligned across multiple responsive cards.',
    mdnTemplateRef: 'https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Contribute_a_recipe/Cookbook_template',
    solution: {
      html: `<div class="mdn-relief-matrix" aria-label="Active Humanitarian Relief Deployments">
  <article class="relief-card">
    <header class="card-head">
      <span class="urgency-badge high">Critical Priority</span>
      <h4>Potable Water & Water Purification Kits</h4>
      <p class="desc">Mobile reverse osmosis filtration units for coastal communities displaced by hurricane landfall.</p>
    </header>
    <div class="metrics-block">
      <div class="progress-info">
        <span>Funded: $184,200</span>
        <strong>Goal: $250,000</strong>
      </div>
      <progress value="74" max="100" class="relief-progress" aria-label="74% of water purification goal reached"></progress>
    </div>
    <footer class="card-actions">
      <button type="button" class="donate-btn">Deploy Kits ($50)</button>
    </footer>
  </article>

  <article class="relief-card">
    <header class="card-head">
      <span class="urgency-badge medium">Urgent Dispatch</span>
      <h4>Emergency Medical Trauma Modules</h4>
      <p class="desc">Sterile trauma packs, surgical antibiotics, and pediatric field triage units.</p>
    </header>
    <div class="metrics-block">
      <div class="progress-info">
        <span>Funded: $410,500</span>
        <strong>Goal: $500,000</strong>
      </div>
      <progress value="82" max="100" class="relief-progress" aria-label="82% of medical trauma goal reached"></progress>
    </div>
    <footer class="card-actions">
      <button type="button" class="donate-btn">Deploy Medical Pack ($100)</button>
    </footer>
  </article>
</div>`,
      css: `/* MDN Layout Cookbook Recipe: Humanitarian Aid Relief Matrix */
.mdn-relief-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  grid-template-rows: auto 1fr auto;
  gap: 1.5rem;
  width: 100%;
}

.relief-card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.5rem;
  color: #f8fafc;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-head h4 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0.5rem 0 0.35rem;
  color: #ffffff;
}

.card-head .desc {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #94a3b8;
  margin: 0;
}

.urgency-badge {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  display: inline-block;
}

.urgency-badge.high {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.urgency-badge.medium {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.metrics-block {
  padding-top: 1rem;
  border-top: 1px solid #1e293b;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.progress-info strong {
  color: #f8fafc;
}

.relief-progress {
  width: 100%;
  height: 8px;
  border-radius: 9999px;
  overflow: hidden;
  accent-color: #10b981;
}

.card-actions {
  padding-top: 1.25rem;
}

.donate-btn {
  width: 100%;
  min-height: 48px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.donate-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.donate-btn:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}`
    },
    howItWorks: [
      {
        property: 'grid-template-rows: subgrid',
        explanation: 'Enables sibling relief cards to participate in the master track sizing, ensuring that the metric progress and donate button rows align regardless of heading length differences.'
      },
      {
        property: 'min-height: 48px on donate-btn',
        explanation: 'Conforms to WCAG 2.5.5 touch target size requirements, essential for volunteers and donors interacting from mobile devices.'
      },
      {
        property: 'native HTML <progress> tag',
        explanation: 'Provides built-in platform accessibility without requiring custom ARIA attribute synchronization.'
      }
    ],
    browserSupport: {
      baseline: 'Baseline 2024 (Supported in all modern engines)',
      safari: 'Safari 16.0+',
      chrome: 'Chrome 117+',
      firefox: 'Firefox 71+',
      fallbacks: 'Older Chromium engines without subgrid support fall back to standard flex-direction: column layout.'
    },
    accessibilityConcerns: [
      {
        rule: 'WCAG 2.5.5 Target Size',
        guideline: 'Minimum touch target size of 44x44px (or 48px for AAA)',
        implementation: 'Buttons have min-height: 48px for mobile users under emergency conditions.'
      }
    ],
    alternatives: [
      {
        approach: 'JavaScript Height Matching (MatchHeight.js)',
        tradeoff: 'Causes layout recalculations on every resize; CSS subgrid operates natively on the browser layout thread.'
      }
    ]
  },
  {
    id: 'recipe-transit-disruption',
    title: 'Public Transit & Infrastructure Disruption Live Ticker',
    topic: 'infrastructure',
    topicLabel: 'Transit & Infrastructure',
    summary: 'A real-time transit disruption status ribbon with live indicator badges, pause-on-hover / pause-on-focus keyboard trapping, and complete prefers-reduced-motion support for civic infrastructure portals.',
    mdnTemplateRef: 'https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Contribute_a_recipe/Cookbook_template',
    solution: {
      html: `<div class="mdn-transit-ticker" role="region" aria-label="Real-time Transit Network Service Status">
  <div class="ticker-badge">
    <span class="live-dot" aria-hidden="true"></span>
    <span>LIVE DISRUPTIONS</span>
  </div>
  <div class="ticker-marquee-track">
    <div class="ticker-content" tabindex="0" aria-label="Transit alerts ticker. Focus or hover to pause scroll.">
      <span class="status-item"><strong class="tag suspended">RED LINE:</strong> Track signal failure between 14th St & Metro Center. Shuttle buses active.</span>
      <span class="status-item"><strong class="tag delayed">BLUE LINE:</strong> 15-minute headway delays due to emergency power maintenance.</span>
      <span class="status-item"><strong class="tag normal">GREEN LINE:</strong> Normal scheduled operations on all regional branches.</span>
    </div>
  </div>
</div>`,
      css: `/* MDN Layout Cookbook Recipe: Transit & Infrastructure Ticker */
.mdn-transit-ticker {
  display: flex;
  align-items: center;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  max-width: 840px;
  width: 100%;
  color: #f8fafc;
}

.ticker-badge {
  background: #1e293b;
  padding: 0.65rem 1rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-right: 1px solid #334155;
  flex-shrink: 0;
  z-index: 2;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.ticker-marquee-track {
  flex: 1;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(to right, transparent, black 20px, black 95%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 20px, black 95%, transparent);
}

.ticker-content {
  display: inline-flex;
  white-space: nowrap;
  animation: tickerSlide 25s linear infinite;
  will-change: transform;
  padding: 0.65rem 1rem;
}

.ticker-content:hover,
.ticker-content:focus-visible {
  animation-play-state: paused;
}

@keyframes tickerSlide {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .ticker-marquee-track {
    mask-image: none;
    -webkit-mask-image: none;
    overflow-x: auto;
  }
  .ticker-content {
    animation: none;
  }
}

.status-item {
  font-size: 0.8125rem;
  margin-right: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.tag {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.tag.suspended { background: #991b1b; color: #fecaca; }
.tag.delayed { background: #92400e; color: #fef3c7; }
.tag.normal { background: #065f46; color: #d1fae5; }`
    },
    howItWorks: [
      {
        property: 'animation-play-state: paused on :hover & :focus-visible',
        explanation: 'Complies with WCAG 2.2.2 requirements allowing users to pause moving content to read at their own pace.'
      },
      {
        property: 'mask-image: linear-gradient(...)',
        explanation: 'Creates smooth edge feathering on both ends of the ticker track without adding extra wrapper markup.'
      },
      {
        property: 'translate3d(-50%, 0, 0)',
        explanation: 'Executes marquee sliding exclusively on the GPU compositor thread, guaranteeing 60fps frame rates.'
      }
    ],
    browserSupport: {
      baseline: 'Widely Available (Full Baseline)',
      safari: 'All Versions',
      chrome: 'All Versions',
      firefox: 'All Versions',
      fallbacks: 'Degrades automatically to a scrollable container in legacy environments.'
    },
    accessibilityConcerns: [
      {
        rule: 'WCAG 2.2.2 Pause, Stop, Hide',
        guideline: 'Moving, blinking, or scrolling content must be pauseable',
        implementation: 'Both cursor hover and keyboard focus pause ticker playback immediately.'
      }
    ],
    alternatives: [
      {
        approach: 'Legacy HTML <marquee>',
        tradeoff: 'Deprecated, unpausable, and lacks modern accessibility semantics.'
      }
    ]
  }
];

