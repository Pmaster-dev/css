import { ResponsiveIssue } from '../types';

export function diagnoseCss(css: string): ResponsiveIssue[] {
  const issues: ResponsiveIssue[] = [];

  // 1. Fixed Pixel Width check (> 360px without max-width)
  const fixedWidthRegex = /(?:(?<!max-)width|min-width):\s*([4-9]\d{2,}|\d{4,})px/gi;
  let match: RegExpExecArray | null;
  while ((match = fixedWidthRegex.exec(css)) !== null) {
    const val = match[1];
    const original = match[0];
    issues.push({
      id: `fixed-width-${val}-${match.index}`,
      title: `Hardcoded ${original} causes mobile horizontal blowout`,
      severity: 'critical',
      category: 'responsive',
      description: `Static width of ${val}px exceeds narrow phone viewports (360-390px), producing horizontal scrolling and clipped UI.`,
      originalSnippet: original,
      fixedSnippet: `width: 100%;\n  max-width: min(100%, ${val}px)`,
      impact: 'Eliminates horizontal overflow on mobile screens.',
    });
  }

  // 2. 100vh Mobile Address Bar bug
  if (/(?<!d|s|l)vh\b/i.test(css) && /height:\s*100vh/i.test(css)) {
    issues.push({
      id: 'viewport-height-100vh',
      title: 'Legacy 100vh triggers iOS/Android address bar jumping',
      severity: 'warning',
      category: 'responsive',
      description: 'Using height: 100vh ignores mobile dynamic address bars. Scrolling down shrinks the bar and causes layout jump.',
      originalSnippet: 'height: 100vh;',
      fixedSnippet: 'min-height: 100vh; /* Fallback */\n  min-height: 100dvh;',
      impact: 'Prevents dynamic viewport jumps on mobile browsers.',
    });
  }

  // 3. Rigid multi-column grid
  const rigidGridRegex = /grid-template-columns:\s*(repeat\([2-9],\s*1fr\)|1fr\s+1fr(\s+1fr)*)/gi;
  if (rigidGridRegex.test(css)) {
    issues.push({
      id: 'rigid-grid-columns',
      title: 'Rigid fixed-column CSS Grid squishes on mobile viewports',
      severity: 'critical',
      category: 'responsive',
      description: 'Forcing 2+ columns with fixed fr units crushes cards to illegible widths on mobile viewports.',
      originalSnippet: css.match(rigidGridRegex)?.[0] || 'grid-template-columns: repeat(3, 1fr);',
      fixedSnippet: 'grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));',
      impact: 'Enables automatic card stacking on mobile while maintaining columns on desktop.',
    });
  }

  // 4. Large static font-size without fluid clamp
  const largeFontRegex = /font-size:\s*(3[2-9]|[4-9]\d|\d{3,})px/gi;
  while ((match = largeFontRegex.exec(css)) !== null) {
    const px = parseInt(match[1], 10);
    const minRem = (px * 0.65 / 16).toFixed(2);
    const maxRem = (px / 16).toFixed(2);
    issues.push({
      id: `fluid-font-${px}-${match.index}`,
      title: `Static heading (${px}px) lacks fluid viewport scaling`,
      severity: 'optimization',
      category: 'responsive',
      description: `Static large text dominates or overflows on compact displays. Modern responsive typography scales smoothly with viewport width.`,
      originalSnippet: match[0],
      fixedSnippet: `font-size: clamp(${minRem}rem, 1rem + 2.5vw, ${maxRem}rem)`,
      impact: 'Scales smoothly from small mobile to ultra-wide displays.',
    });
  }

  // 5. Missing overflow-wrap / text blowout protection
  if (!/overflow-wrap:\s*(break-word|anywhere)/i.test(css) && !/word-break:\s*break-word/i.test(css)) {
    issues.push({
      id: 'missing-overflow-wrap',
      title: 'Missing word-wrap protection for long strings',
      severity: 'warning',
      category: 'responsive',
      description: 'Long words, email addresses, or URLs will overflow small containers without overflow-wrap.',
      originalSnippet: '/* Container or typography rules */',
      fixedSnippet: 'overflow-wrap: anywhere;\n  word-break: break-word;',
      impact: 'Protects against content boundary overflow from unbroken text.',
    });
  }

  // 6. Sub-44px touch target risk
  const smallTargetRegex = /(?:height|width):\s*([1-3]\d)px/gi;
  if (smallTargetRegex.test(css) && /(button|\.btn|\.interactive|a\b)/i.test(css)) {
    issues.push({
      id: 'touch-target-size',
      title: 'Interactive control under 44px minimum touch target',
      severity: 'a11y',
      category: 'a11y',
      description: 'WCAG 2.5.5 recommends touch targets be at least 44x44px for thumb/touch accessibility.',
      originalSnippet: 'button, .btn { ... }',
      fixedSnippet: '@media (pointer: coarse) {\n  button, .btn, a.button {\n    min-width: 44px;\n    min-height: 44px;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n  }\n}',
      impact: 'Guarantees comfortable tap accessibility on touch screens.',
    });
  }

  // 7. Outline: none / focus trapped
  if (/outline:\s*(none|0\b)/i.test(css) && !/:focus-visible/i.test(css)) {
    issues.push({
      id: 'missing-focus-visible',
      title: 'Accessibility trap: outline: none without :focus-visible replacement',
      severity: 'a11y',
      category: 'a11y',
      description: 'Stripping focus indicators renders the page unusable for keyboard and screen-reader users (WCAG 2.4.7).',
      originalSnippet: 'outline: none;',
      fixedSnippet: ':focus-visible {\n  outline: 2px solid currentColor;\n  outline-offset: 3px;\n}',
      impact: 'Restores keyboard navigation ring without disturbing mouse clicks.',
    });
  }

  // 8. Heavy CPU backdrop-filter blur
  if (/backdrop-filter:\s*blur\(([1-9]\d|\d{3,})px\)/i.test(css)) {
    issues.push({
      id: 'cpu-backdrop-filter',
      title: 'High CPU/GPU composite cost: heavy backdrop blur filter',
      severity: 'cpu',
      category: 'cpu',
      description: 'Backdrop blurs >10px trigger GPU rasterization bottlenecks, resulting in frame drops on lower-spec hardware or mobile.',
      originalSnippet: css.match(/backdrop-filter:\s*blur\([^\)]+\);?/i)?.[0] || 'backdrop-filter: blur(20px);',
      fixedSnippet: 'background: rgba(var(--surface-rgb, 255, 255, 255), 0.85);\n  @supports (backdrop-filter: blur(8px)) {\n    backdrop-filter: blur(8px);\n  }',
      impact: 'Reduces paint time by up to ~65% on integrated GPUs and low-power CPUs.',
    });
  }

  // 9. CPU reflow trigger: animating width/height/top/left
  if (/transition:\s*([^;]*(width|height|top|left|margin|padding)[^;]*)/i.test(css)) {
    const transMatch = css.match(/transition:\s*([^;]*(width|height|top|left|margin|padding)[^;]*);?/i);
    issues.push({
      id: 'cpu-layout-thrashing',
      title: 'Layout reflow thrashing: animating geometry properties',
      severity: 'cpu',
      category: 'cpu',
      description: 'Transitions on width, height, or top/left force full document reflow on every frame. Use transform and opacity instead.',
      originalSnippet: transMatch?.[0] || 'transition: all 0.3s ease;',
      fixedSnippet: 'transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;\n  will-change: transform, opacity;',
      impact: 'Offloads animation to GPU compositor thread, yielding buttery 60/120 FPS.',
    });
  }

  // 10. Missing responsive media rules
  if (!/max-width:\s*100%/i.test(css) && /(img|video|canvas|iframe)/i.test(css)) {
    issues.push({
      id: 'unconstrained-media',
      title: 'Media elements lack responsive max-width containment',
      severity: 'warning',
      category: 'responsive',
      description: 'Images and videos without max-width: 100% burst outside parent containers on mobile viewports.',
      originalSnippet: 'img, video { ... }',
      fixedSnippet: 'img, video, canvas, svg {\n  max-width: 100%;\n  height: auto;\n  display: block;\n}',
      impact: 'Prevents oversized images from breaking mobile page layouts.',
    });
  }

  return issues;
}

export function applyAutoFix(originalCss: string, issueIdsToFix: string[]): { newCss: string; fixesApplied: number } {
  let fixed = originalCss;
  let fixesApplied = 0;

  // 1. Fix 100vh
  if (issueIdsToFix.some(id => id.includes('100vh'))) {
    const before = fixed;
    fixed = fixed.replace(/height:\s*100vh;/gi, 'min-height: 100vh;\n  min-height: 100dvh;');
    if (fixed !== before) fixesApplied++;
  }

  // 2. Fix rigid grid
  if (issueIdsToFix.some(id => id.includes('rigid-grid'))) {
    const before = fixed;
    fixed = fixed.replace(
      /grid-template-columns:\s*(repeat\([2-9],\s*1fr\)|1fr\s+1fr(\s+1fr)*);?/gi,
      'grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));'
    );
    if (fixed !== before) fixesApplied++;
  }

  // 3. Fix fixed width
  issueIdsToFix.forEach(id => {
    if (id.startsWith('fixed-width-')) {
      const parts = id.split('-');
      const val = parts[2];
      if (val) {
        const reg = new RegExp(`width:\\s*${val}px;?`, 'gi');
        if (reg.test(fixed)) {
          fixed = fixed.replace(reg, `width: 100%;\n  max-width: min(100%, ${val}px);`);
          fixesApplied++;
        }
      }
    }
  });

  // 4. Fix large fonts
  issueIdsToFix.forEach(id => {
    if (id.startsWith('fluid-font-')) {
      const parts = id.split('-');
      const px = parseInt(parts[2], 10);
      if (px) {
        const minRem = (px * 0.65 / 16).toFixed(2);
        const maxRem = (px / 16).toFixed(2);
        const reg = new RegExp(`font-size:\\s*${px}px;?`, 'gi');
        if (reg.test(fixed)) {
          fixed = fixed.replace(reg, `font-size: clamp(${minRem}rem, 1rem + 2vw, ${maxRem}rem);`);
          fixesApplied++;
        }
      }
    }
  });

  // 5. Fix overflow wrap
  if (issueIdsToFix.some(id => id === 'missing-overflow-wrap')) {
    if (!/overflow-wrap/i.test(fixed)) {
      fixed = `/* Responsive Auto-Fix: Word-wrap protection */\n*,\n*::before,\n*::after {\n  overflow-wrap: anywhere;\n  word-break: break-word;\n}\n\n` + fixed;
      fixesApplied++;
    }
  }

  // 6. Fix touch targets
  if (issueIdsToFix.some(id => id === 'touch-target-size')) {
    if (!/@media \(pointer: coarse\)/i.test(fixed)) {
      fixed += `\n\n/* Responsive Auto-Fix: Minimum 44px touch target on coarse pointers */\n@media (pointer: coarse) {\n  button,\n  .btn,\n  a[role="button"],\n  input[type="button"],\n  input[type="submit"] {\n    min-height: 44px;\n    min-width: 44px;\n    padding: 10px 18px;\n  }\n}`;
      fixesApplied++;
    }
  }

  // 7. Fix focus visible
  if (issueIdsToFix.some(id => id === 'missing-focus-visible')) {
    fixed = fixed.replace(/outline:\s*(none|0);?/gi, '');
    if (!/:focus-visible/i.test(fixed)) {
      fixed += `\n\n/* Accessibility Auto-Fix: Keyboard focus indicator */\n:focus-visible {\n  outline: 2px solid #3b82f6;\n  outline-offset: 3px;\n}`;
      fixesApplied++;
    }
  }

  // 8. Fix CPU backdrop-filter
  if (issueIdsToFix.some(id => id === 'cpu-backdrop-filter')) {
    const before = fixed;
    fixed = fixed.replace(
      /backdrop-filter:\s*blur\(([1-9]\d|\d{3,})px\);?/gi,
      'backdrop-filter: blur(8px);'
    );
    if (fixed !== before) fixesApplied++;
  }

  // 9. Fix layout thrashing
  if (issueIdsToFix.some(id => id === 'cpu-layout-thrashing')) {
    const before = fixed;
    fixed = fixed.replace(
      /transition:\s*all\s*([0-9.]+s)?/gi,
      'transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease'
    );
    fixed = fixed.replace(
      /transition:\s*([^;]*(width|height|top|left)[^;]*);?/gi,
      'transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;\n  will-change: transform, opacity;'
    );
    if (fixed !== before) fixesApplied++;
  }

  // 10. Fix unconstrained media
  if (issueIdsToFix.some(id => id === 'unconstrained-media')) {
    if (!/img,\s*video/i.test(fixed)) {
      fixed = `/* Responsive Auto-Fix: Fluid Media Constraints */\nimg, video, canvas, svg {\n  max-width: 100%;\n  height: auto;\n  display: block;\n}\n\n` + fixed;
      fixesApplied++;
    }
  }

  return { newCss: fixed, fixesApplied };
}
