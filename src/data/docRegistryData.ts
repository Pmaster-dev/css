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
