/**
 * Legacy Browser Compatibility Scanner
 * Scans active CSS rules for properties, pseudo-classes, and values that break in legacy browsers
 * (IE11, older Safari, older Chrome/Firefox, legacy Android WebViews)
 * and connects with Chromium engine platform status and modern alternatives.
 */

import { CompatibilityScanReport, LegacySupportIssue, SupportRiskLevel } from '../types';

interface RuleDefinition {
  id: string;
  pattern: RegExp;
  featureName: string;
  riskLevel: SupportRiskLevel;
  legacyStatusSummary: string;
  affectedBrowsers: {
    browser: string;
    unsupportedVersions: string;
    baselineStatus: string;
  }[];
  searchQueryTemplate: string;
  caniuseTopic: string;
  mdnSlug: string;
  modernAlternative: string;
  getFallbackSnippet: (match: string) => string;
  getAutoFix?: (line: string) => { find: string; replaceWith: string } | null;
}

export const KNOWN_LEGACY_RULES: RuleDefinition[] = [
  {
    id: 'rule-subgrid',
    pattern: /subgrid/i,
    featureName: 'grid-template-rows / columns: subgrid',
    riskLevel: 'high',
    legacyStatusSummary: 'Completely unhandled in Safari < 16, Chrome < 117, Edge < 117, and all versions of IE.',
    affectedBrowsers: [
      { browser: 'Safari (iOS & macOS)', unsupportedVersions: '< 16.0', baselineStatus: 'Broken layout' },
      { browser: 'Chrome / Edge', unsupportedVersions: '< 117', baselineStatus: 'Defaults to 0 or unnested track' },
      { browser: 'Internet Explorer', unsupportedVersions: 'All (6-11)', baselineStatus: 'Unsupported' },
      { browser: 'Firefox', unsupportedVersions: '< 71', baselineStatus: 'Unsupported' }
    ],
    searchQueryTemplate: 'CSS subgrid browser support fallback legacy safari chrome',
    caniuseTopic: 'css-subgrid',
    mdnSlug: 'Web/CSS/CSS_grid_layout/Subgrid',
    modernAlternative: 'Wrap in @supports (grid-template-rows: subgrid) { ... } with a fallback single-level grid or flexbox layout.',
    getFallbackSnippet: () => `/* Legacy browser fallback */
.card-grid {
  display: grid;
  grid-template-rows: auto 1fr auto;
}
@supports (grid-template-rows: subgrid) {
  .card-item {
    grid-row: span 3;
    grid-template-rows: subgrid;
  }
}`,
    getAutoFix: (line: string) => {
      if (line.includes('subgrid')) {
        return {
          find: line,
          replaceWith: `  /* Fallback for legacy browsers */\n  grid-template-rows: auto 1fr auto;\n  @supports (grid-template-rows: subgrid) {\n  ${line.trim()}\n  }`
        };
      }
      return null;
    }
  },
  {
    id: 'rule-has-selector',
    pattern: /:has\s*\(/i,
    featureName: ':has() Relational Parent Selector',
    riskLevel: 'high',
    legacyStatusSummary: 'Fails in Firefox < 121 (released Dec 2023), Safari < 15.4, Chrome < 105, and all IE.',
    affectedBrowsers: [
      { browser: 'Firefox', unsupportedVersions: '< 121.0', baselineStatus: 'Ignores entire rule block' },
      { browser: 'Safari', unsupportedVersions: '< 15.4', baselineStatus: 'Selector rejected' },
      { browser: 'Chrome / Edge', unsupportedVersions: '< 105.0', baselineStatus: 'Selector rejected' },
      { browser: 'Internet Explorer', unsupportedVersions: 'All', baselineStatus: 'Unsupported' }
    ],
    searchQueryTemplate: 'CSS has selector browser support fallback legacy polyfill',
    caniuseTopic: 'css-has',
    mdnSlug: 'Web/CSS/:has',
    modernAlternative: 'Provide a base state for the selector, or use progressive class names toggled via lightweight JS dataset or @supports selector(:has(*)).',
    getFallbackSnippet: () => `/* Safe progressive fallback */
@supports selector(:has(*)) {
  .card:has(.badge) {
    border-color: #2563eb;
  }
}
/* Legacy class fallback */
.card.has-badge {
  border-color: #2563eb;
}`,
    getAutoFix: (line: string) => {
      return {
        find: line,
        replaceWith: `@supports selector(:has(*)) {\n${line}\n}`
      };
    }
  },
  {
    id: 'rule-color-mix',
    pattern: /color-mix\s*\(/i,
    featureName: 'color-mix() Perceptual Color Blending',
    riskLevel: 'high',
    legacyStatusSummary: 'Fails in Safari < 16.2, Chrome < 111, Firefox < 113, and all older Android WebViews.',
    affectedBrowsers: [
      { browser: 'Chrome / Android', unsupportedVersions: '< 111', baselineStatus: 'Property dropped (transparent/blank)' },
      { browser: 'Safari (iOS)', unsupportedVersions: '< 16.2', baselineStatus: 'Invalid color property' },
      { browser: 'Firefox', unsupportedVersions: '< 113', baselineStatus: 'Invalid value' },
      { browser: 'IE / Legacy Edge', unsupportedVersions: 'All', baselineStatus: 'Unsupported' }
    ],
    searchQueryTemplate: 'CSS color-mix browser support fallback legacy safari',
    caniuseTopic: 'mdn-css_types_color_color-mix',
    mdnSlug: 'Web/CSS/color_value/color-mix',
    modernAlternative: 'Declare a solid hex / rgba() fallback color immediately prior to the color-mix() property declaration.',
    getFallbackSnippet: (match: string) => `/* Dual declaration fallback */
background-color: #2563eb; /* Legacy fallback */
background-color: ${match}; /* Modern CSS Color 4 */`,
    getAutoFix: (line: string) => {
      const propMatch = line.match(/^(\s*)([\w-]+):\s*(color-mix\(.+\));?/);
      if (propMatch) {
        const indent = propMatch[1];
        const prop = propMatch[2];
        return {
          find: line,
          replaceWith: `${indent}/* Legacy fallback */\n${indent}${prop}: #3b82f6;\n${line}`
        };
      }
      return null;
    }
  },
  {
    id: 'rule-oklch-lch',
    pattern: /(oklch|oklab|lch|lab)\s*\(/i,
    featureName: 'OKLCH / LCH Wide Gamut Colors',
    riskLevel: 'high',
    legacyStatusSummary: 'Fails in Safari < 15.4, Chrome < 111, Firefox < 113, Edge < 111, and all IE.',
    affectedBrowsers: [
      { browser: 'Chrome / Edge', unsupportedVersions: '< 111', baselineStatus: 'Syntax error; dropped property' },
      { browser: 'Safari', unsupportedVersions: '< 15.4', baselineStatus: 'Dropped property' },
      { browser: 'Internet Explorer', unsupportedVersions: 'All', baselineStatus: 'Unsupported' }
    ],
    searchQueryTemplate: 'CSS OKLCH browser support fallback legacy browsers sRGB',
    caniuseTopic: 'css-lch-lab',
    mdnSlug: 'Web/CSS/color_value/oklch',
    modernAlternative: 'Provide an sRGB (hex or rgb()) fallback on the preceding line for older rendering engines.',
    getFallbackSnippet: () => `/* Preceding sRGB fallback */
color: #2563eb; /* sRGB for legacy browsers */
color: oklch(0.6 0.2 250); /* Wide gamut OKLCH */`,
    getAutoFix: (line: string) => {
      const propMatch = line.match(/^(\s*)([\w-]+):\s*.*(oklch|lch|oklab|lab)\(.+\);?/);
      if (propMatch) {
        const indent = propMatch[1];
        const prop = propMatch[2];
        return {
          find: line,
          replaceWith: `${indent}/* Legacy sRGB fallback */\n${indent}${prop}: #2563eb;\n${line}`
        };
      }
      return null;
    }
  },
  {
    id: 'rule-dvh-svh',
    pattern: /\b\d+(\.\d+)?(dvh|svh|lvh|dvw|svw|lvw)\b/i,
    featureName: 'Dynamic Viewport Units (dvh / svh / lvh)',
    riskLevel: 'moderate',
    legacyStatusSummary: 'Fails in Safari < 15.4, Chrome < 108, Firefox < 101, and iOS 14.',
    affectedBrowsers: [
      { browser: 'Safari (iOS)', unsupportedVersions: '< 15.4', baselineStatus: 'Ignored property' },
      { browser: 'Chrome', unsupportedVersions: '< 108', baselineStatus: 'Ignored property' },
      { browser: 'Internet Explorer', unsupportedVersions: 'All', baselineStatus: 'Unsupported' }
    ],
    searchQueryTemplate: 'CSS dvh unit browser support fallback 100vh safari legacy',
    caniuseTopic: 'viewport-unit-variants',
    mdnSlug: 'Web/CSS/length#dvh',
    modernAlternative: 'Declare a 100vh fallback line right before the dvh declaration.',
    getFallbackSnippet: () => `/* Cascading fallback */
min-height: 100vh;  /* Supported everywhere */
min-height: 100dvh; /* Dynamic address bar safe */`,
    getAutoFix: (line: string) => {
      if (line.includes('dvh') || line.includes('svh')) {
        const fallback = line.replace(/(\d+)(dvh|svh|lvh)/g, '$1vh');
        return {
          find: line,
          replaceWith: `${fallback}\n${line}`
        };
      }
      return null;
    }
  },
  {
    id: 'rule-container-queries',
    pattern: /(@container|container-type|container-name)/i,
    featureName: 'CSS Container Queries (@container)',
    riskLevel: 'high',
    legacyStatusSummary: 'Fails in Chrome < 105, Safari < 16.0, Firefox < 110, and all IE.',
    affectedBrowsers: [
      { browser: 'Chrome / Edge', unsupportedVersions: '< 105', baselineStatus: 'Rule ignored' },
      { browser: 'Safari', unsupportedVersions: '< 16.0', baselineStatus: 'Rule ignored' },
      { browser: 'Firefox', unsupportedVersions: '< 110', baselineStatus: 'Rule ignored' }
    ],
    searchQueryTemplate: 'CSS container queries browser support fallback legacy polyfill',
    caniuseTopic: 'css-container-queries',
    mdnSlug: 'Web/CSS/CSS_container_queries',
    modernAlternative: 'Use standard media queries (@media (min-width: ...)) as base styles, and enhance with @supports (container-type: inline-size).',
    getFallbackSnippet: () => `/* Viewport fallback */
@media (min-width: 640px) {
  .card { grid-template-columns: 1fr 1fr; }
}
/* Container Query enhancement */
@supports (container-type: inline-size) {
  @container (min-width: 400px) {
    .card { grid-template-columns: 1fr 1fr; }
  }
}`
  },
  {
    id: 'rule-backdrop-filter',
    pattern: /backdrop-filter\s*:/i,
    featureName: 'backdrop-filter: blur()',
    riskLevel: 'moderate',
    legacyStatusSummary: 'Requires -webkit- prefix in Safari < 16.0. Fails in IE11 and older Firefox without user flag.',
    affectedBrowsers: [
      { browser: 'Safari (iOS & macOS)', unsupportedVersions: '< 16.0 (needs prefix)', baselineStatus: 'Missing glass blur' },
      { browser: 'Firefox', unsupportedVersions: '< 103 (unprefixed)', baselineStatus: 'Glass effect skipped' },
      { browser: 'Internet Explorer', unsupportedVersions: 'All', baselineStatus: 'Unsupported' }
    ],
    searchQueryTemplate: 'CSS backdrop-filter browser support webkit prefix safari fallback',
    caniuseTopic: 'css-backdrop-filter',
    mdnSlug: 'Web/CSS/backdrop-filter',
    modernAlternative: 'Include -webkit-backdrop-filter and a slightly more opaque background-color fallback.',
    getFallbackSnippet: () => `/* Glassmorphism legacy resilience */
background: rgba(15, 23, 42, 0.85); /* Slightly darker fallback */
-webkit-backdrop-filter: blur(12px); /* Safari prefix */
backdrop-filter: blur(12px);`,
    getAutoFix: (line: string) => {
      if (line.includes('backdrop-filter') && !line.includes('-webkit-')) {
        const indent = line.match(/^(\s*)/)?.[1] || '  ';
        const val = line.split(':')[1]?.trim() || 'blur(12px);';
        return {
          find: line,
          replaceWith: `${indent}-webkit-backdrop-filter: ${val}\n${line}`
        };
      }
      return null;
    }
  },
  {
    id: 'rule-aspect-ratio',
    pattern: /aspect-ratio\s*:/i,
    featureName: 'aspect-ratio Property',
    riskLevel: 'moderate',
    legacyStatusSummary: 'Fails in Safari < 15.0, Chrome < 88, Firefox < 89, and all IE.',
    affectedBrowsers: [
      { browser: 'Safari (iOS 14 / macOS)', unsupportedVersions: '< 15.0', baselineStatus: 'Stretches or collapses height' },
      { browser: 'Internet Explorer', unsupportedVersions: 'All', baselineStatus: 'Unsupported' }
    ],
    searchQueryTemplate: 'CSS aspect-ratio browser support fallback padding-top hack',
    caniuseTopic: 'mdn-css_properties_aspect-ratio',
    mdnSlug: 'Web/CSS/aspect-ratio',
    modernAlternative: 'Use the padding-top percentage technique, or set explicit width/height dimensions inside @supports not (aspect-ratio: 1).',
    getFallbackSnippet: () => `/* Modern aspect-ratio with legacy fallback */
@supports not (aspect-ratio: 16 / 9) {
  .media-wrapper {
    position: relative;
    padding-top: 56.25%; /* 16:9 ratio */
  }
  .media-wrapper > * {
    position: absolute;
    inset: 0;
  }
}`
  },
  {
    id: 'rule-text-wrap',
    pattern: /text-wrap\s*:\s*(balance|pretty)/i,
    featureName: 'text-wrap: balance / pretty',
    riskLevel: 'moderate',
    legacyStatusSummary: 'Fails in Safari < 17.4, Firefox < 121, Chrome < 114, and all older browsers.',
    affectedBrowsers: [
      { browser: 'Safari', unsupportedVersions: '< 17.4', baselineStatus: 'Falls back to normal wrap' },
      { browser: 'Firefox', unsupportedVersions: '< 121', baselineStatus: 'Falls back to normal wrap' }
    ],
    searchQueryTemplate: 'CSS text-wrap balance pretty browser support fallback legacy',
    caniuseTopic: 'css-text-wrap-balance',
    mdnSlug: 'Web/CSS/text-wrap',
    modernAlternative: 'Graceful degradation is automatic, but ensure max-inline-size (ch units) is defined for comfortable reading length in legacy browsers.',
    getFallbackSnippet: () => `/* Graceful fallback */
max-width: 65ch; /* Keeps lines readable in legacy browsers */
text-wrap: balance; /* Enhances modern typography */`
  },
  {
    id: 'rule-flex-gap',
    pattern: /display\s*:\s*flex[^;]*;[^}]*gap\s*:/is,
    featureName: 'Flexbox gap Property',
    riskLevel: 'moderate',
    legacyStatusSummary: 'Fails in Safari < 14.1 (iOS 14.4 and earlier). Gap is completely ignored in flex containers.',
    affectedBrowsers: [
      { browser: 'Safari (iOS 14 / macOS Catalina)', unsupportedVersions: '< 14.1', baselineStatus: 'Child items touch without spacing' },
      { browser: 'Internet Explorer', unsupportedVersions: 'All (10-11)', baselineStatus: 'Unsupported' }
    ],
    searchQueryTemplate: 'CSS flexbox gap Safari 14 browser support fallback legacy margin',
    caniuseTopic: 'flexbox-gap',
    mdnSlug: 'Web/CSS/gap',
    modernAlternative: 'Use margin on child items, or convert to CSS Grid (display: grid has 99.5% universal gap support).',
    getFallbackSnippet: () => `/* CSS Grid has wider legacy gap support than flexbox */
.container {
  display: grid;
  grid-auto-flow: column;
  gap: 1rem;
}`
  },
  {
    id: 'rule-logical-properties',
    pattern: /(margin-inline|padding-inline|inset-inline|inline-size|block-size)\s*:/i,
    featureName: 'CSS Logical Properties (margin/padding-inline)',
    riskLevel: 'moderate',
    legacyStatusSummary: 'Fails in IE11 and older Edge (pre-Chromium).',
    affectedBrowsers: [
      { browser: 'Internet Explorer', unsupportedVersions: '11 and older', baselineStatus: 'Ignored completely' },
      { browser: 'Legacy Edge', unsupportedVersions: '< 79', baselineStatus: 'Partial support' }
    ],
    searchQueryTemplate: 'CSS margin-inline padding-inline browser support IE11 fallback',
    caniuseTopic: 'css-logical-props',
    mdnSlug: 'Web/CSS/CSS_logical_properties_and_values',
    modernAlternative: 'Add physical margin-left/margin-right fallbacks before the logical property declaration.',
    getFallbackSnippet: () => `/* Physical fallback for IE11/legacy */
margin-left: auto;
margin-right: auto;
margin-inline: auto;`
  }
];

/**
 * Scans a CSS string using the built-in specification rules.
 */
export function scanCssForLegacyIssues(css: string): CompatibilityScanReport {
  const lines = css.split('\n');
  const issues: LegacySupportIssue[] = [];
  const scannedProperties = new Set<string>();

  // Count total properties
  for (const line of lines) {
    const propMatch = line.match(/^\s*([a-zA-Z-][a-zA-Z0-9-]*)\s*:/);
    if (propMatch) {
      scannedProperties.add(propMatch[1].toLowerCase());
    }
  }

  KNOWN_LEGACY_RULES.forEach((rule) => {
    let matched = false;
    let matchedLineNumber: number | undefined;
    let snippet = '';
    let autoFix: { find: string; replaceWith: string } | undefined;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (rule.pattern.test(line)) {
        matched = true;
        matchedLineNumber = i + 1;
        snippet = line.trim();
        if (rule.getAutoFix) {
          const fix = rule.getAutoFix(line);
          if (fix) autoFix = fix;
        }
        break;
      }
    }

    // Also test multiline if pattern is multiline
    if (!matched && rule.pattern.test(css)) {
      matched = true;
      snippet = rule.featureName;
    }

    if (matched) {
      const chromiumQuery = `Chromium CSS ${rule.featureName} compatibility baseline`;
      const chromiumUrl = `https://chromestatus.com/features#${encodeURIComponent(rule.featureName)}`;
      const googleSearchQuery = rule.searchQueryTemplate;
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(googleSearchQuery)}`;
      const caniuseUrl = `https://caniuse.com/${rule.caniuseTopic}`;
      const mdnUrl = `https://developer.mozilla.org/en-US/docs/${rule.mdnSlug}`;

      issues.push({
        id: `${rule.id}-${matchedLineNumber || 0}`,
        propertyOrFeature: rule.featureName,
        matchedLineNumber,
        snippet,
        riskLevel: rule.riskLevel,
        legacyStatusSummary: rule.legacyStatusSummary,
        affectedBrowsers: rule.affectedBrowsers,
        chromiumQuery,
        chromiumUrl,
        googleSearchQuery,
        googleSearchUrl,
        caniuseUrl,
        mdnUrl,
        modernAlternative: rule.modernAlternative,
        fallbackCssSnippet: rule.getFallbackSnippet(snippet),
        autoFixCode: autoFix
      });
    }
  });

  const highRiskCount = issues.filter((i) => i.riskLevel === 'high').length;
  const moderateRiskCount = issues.filter((i) => i.riskLevel === 'moderate').length;
  const safeCount = Math.max(0, scannedProperties.size - issues.length);

  return {
    timestamp: new Date().toISOString(),
    totalPropertiesScanned: Math.max(scannedProperties.size, issues.length),
    highRiskCount,
    moderateRiskCount,
    safeCount,
    isAiChromiumPowered: false,
    isAiGoogleSearchPowered: false,
    issues
  };
}

/**
 * Creates sample test CSS containing intentional legacy browser compatibility issues
 */
export function getSampleLegacyTestCss(): string {
  return `/* Component: High-End Interactive Card Matrix with Modern CSS4 */
.card-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-template-rows: auto auto auto;
  gap: 1.5rem;
  min-height: 100dvh;
}

.matrix-card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
  margin-inline: auto;
  aspect-ratio: 16 / 9;
  background-color: color-mix(in oklch, #2563eb 80%, #ffffff);
  border: 1px solid oklch(0.7 0.15 240);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(12px);
}

.matrix-card:has(.badge-featured) {
  border-color: #f59e0b;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.2);
}

.card-title {
  text-wrap: balance;
  font-size: 1.5rem;
  font-weight: 800;
}`;
}
