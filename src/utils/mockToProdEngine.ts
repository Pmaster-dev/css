import { MockToProdRisk, MockToProdReport } from '../types';

/**
 * Advanced Mock-to-Prod Engineering Engine
 * Bridges the intellectual gap between design mocks (Figma, rapid prototypes)
 * and hardened production reality for both experienced architects and no-experience developers.
 */

export function analyzeMockToProd(css: string): MockToProdReport {
  const risks: MockToProdRisk[] = [];
  let fixedPixelCount = 0;
  let viewportHeightTrapCount = 0;
  let unprotectedOverflowCount = 0;
  let heavyFilterCount = 0;
  let missingSafeAreaCount = 0;

  const lines = css.split('\n');

  // Check 1: Rigid Pixel Widths (Design mock assumption: user has a 1440px display)
  const rigidWidthRegex = /(?:width|min-width):\s*(\d{3,4})px/gi;
  let match: RegExpExecArray | null;
  while ((match = rigidWidthRegex.exec(css)) !== null) {
    const val = parseInt(match[1], 10);
    if (val >= 480) {
      fixedPixelCount++;
      if (fixedPixelCount === 1) {
        risks.push({
          id: 'risk-rigid-pixel-width',
          category: 'viewport-rigidity',
          title: `Hardcoded Desktop Width (${val}px) Breaks on Smaller Screens`,
          plainEnglishExplanation: 
            `Design mocks are drawn on fixed canvas sizes (like 1440px or 1200px). When this CSS runs on a real phone or tablet in production, users see a horizontal scrollbar or cut-off content because the screen is smaller than the hardcoded ${val}px.`,
          architecturalImpact: 
            `Violates fluid viewport layout. Causes Horizontal Scroll defect on viewports <${val}px, resulting in severe Cumulative Layout Shift (CLS) and degraded Google mobile-friendliness indexing.`,
          mockArtifactSnippet: match[0],
          prodHardenedSnippet: `max-width: min(${val}px, 100% - 2rem); width: 100%; margin-inline: auto;`,
          severity: 'critical',
          autoFixAvailable: true,
        });
      }
    }
  }

  // Check 2: 100vh Viewport Height Trap on Mobile Browsers
  if (/100vh/i.test(css) && !/100dvh/i.test(css)) {
    viewportHeightTrapCount++;
    risks.push({
      id: 'risk-100vh-mobile-jump',
      category: 'viewport-rigidity',
      title: 'Rigid "100vh" Causes Sudden Jump When Mobile URL Bar Appears',
      plainEnglishExplanation: 
        `In desktop mocks, 100vh fills the whole screen nicely. But on mobile Safari and Chrome, the URL bar slides in and out as the user scrolls. Traditional 100vh ignores the URL bar, causing buttons at the bottom of the screen to be covered up or jump erratically.`,
      architecturalImpact: 
        `100vh corresponds to the initial layout viewport, not the dynamic viewport. In iOS Safari and Android Chrome, this leads to occluded call-to-actions, tap target misfires, and jarring visual jitter during kinetic scrolling.`,
      mockArtifactSnippet: 'height: 100vh; min-height: 100vh;',
      prodHardenedSnippet: 'min-height: 100vh; min-height: 100dvh; /* Dynamic Viewport Height */',
      severity: 'high',
      autoFixAvailable: true,
    });
  }

  // Check 3: Missing Safe-Area Inset on Fixed Navigation / Floating Elements
  const hasFixedSticky = /(?:position:\s*(?:fixed|sticky))/i.test(css);
  const hasSafeArea = /env\(\s*safe-area-inset-/i.test(css);
  if (hasFixedSticky && !hasSafeArea) {
    missingSafeAreaCount++;
    risks.push({
      id: 'risk-missing-safe-area',
      category: 'mobile-notch',
      title: 'Fixed Header/Bar Collides With Phone Notches & Home Gesture Bars',
      plainEnglishExplanation: 
        `Modern phones (iPhone Dynamic Island, notch phones, rounded tablet corners) have special sensor areas and gesture bars. Without safe-area protection, your fixed buttons or headers will be hidden underneath the camera notch or home bar.`,
      architecturalImpact: 
        `Fails iPhone X+ viewport safety constraints. Touch targets placed at bottom: 0 collide with the iOS home indicator gesture recognizer, causing cancelled touch events and unusable navigation.`,
      mockArtifactSnippet: 'position: fixed; bottom: 0; left: 0; right: 0; padding: 12px;',
      prodHardenedSnippet: 'padding-bottom: max(12px, env(safe-area-inset-bottom)); padding-top: max(12px, env(safe-area-inset-top));',
      severity: 'high',
      autoFixAvailable: true,
    });
  }

  // Check 4: CPU & Battery Drain from Unbounded Blur / Nested Shadows
  const blurMatches = css.match(/backdrop-filter:\s*blur\(\s*(\d+)px\s*\)/gi);
  if (blurMatches && blurMatches.some(m => {
    const px = parseInt(m.replace(/[^0-9]/g, ''), 10);
    return px > 12;
  })) {
    heavyFilterCount++;
    risks.push({
      id: 'risk-heavy-backdrop-blur',
      category: 'cpu-drain',
      title: 'Deep Backdrop Blur Stutters Scroll on Low-End Mobile CPUs',
      plainEnglishExplanation: 
        `The popular "frosted glass" look looks butter-smooth on a high-end designer laptop. But on budget Android phones or laptops running on battery saver, recalculating real-time blur behind scrolling content drops frame rates from 60fps down to 15fps, draining user battery.`,
      architecturalImpact: 
        `Forces offscreen render passes on every compositor tick. Leads to frame drops, high Interaction to Next Paint (INP) latency, and GPU thermal throttling on budget devices. Requires @media (prefers-reduced-transparency) or hardware-isolated fallback.`,
      mockArtifactSnippet: 'backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);',
      prodHardenedSnippet: '@media (prefers-reduced-transparency: no-preference) { backdrop-filter: blur(12px); } @media (prefers-reduced-transparency: reduce) { background: rgba(15, 23, 42, 0.95); }',
      severity: 'moderate',
      autoFixAvailable: true,
    });
  }

  // Check 5: Non-Scalable Hardcoded Font Sizes
  const fixedPxFont = /font-size:\s*(\d+)px/gi;
  let fontMatch: RegExpExecArray | null;
  let largeFontPxCount = 0;
  while ((fontMatch = fixedPxFont.exec(css)) !== null) {
    const fs = parseInt(fontMatch[1], 10);
    if (fs > 24) largeFontPxCount++;
  }
  if (largeFontPxCount > 0) {
    risks.push({
      id: 'risk-fixed-px-typography',
      category: 'accessibility-trap',
      title: 'Static Pixel Headings Break on Small Displays & Accessibility Zoom',
      plainEnglishExplanation: 
        `When text size is set in rigid pixels (e.g. font-size: 48px), the heading won't shrink on a narrow smartphone, wrapping into awkward one-word lines. It also ignores the user's phone accessibility font size settings.`,
      architecturalImpact: 
        `Violates WCAG 1.4.4 Resize Text (Level AA). Fails fluid typographic hierarchy. Headings overflow mobile containers without fluid clamp() equations.`,
      mockArtifactSnippet: 'font-size: 36px; line-height: 44px;',
      prodHardenedSnippet: 'font-size: clamp(1.5rem, 4vw + 1rem, 2.5rem); line-height: 1.25;',
      severity: 'moderate',
      autoFixAvailable: true,
    });
  }

  // Check 6: Global Naked Tag Selectors (CSS Leaks into Production Environment)
  const globalLeakRegex = /^(?:body|html|button|input|h1|h2|p)\s*\{/gm;
  if (globalLeakRegex.test(css)) {
    risks.push({
      id: 'risk-global-selector-leak',
      category: 'css-leak',
      title: 'Global Selectors (body, button) Will Override Production Host Styles',
      plainEnglishExplanation: 
        `In an isolated mock prototype, styling "button" or "body" directly works fine. But when deployed into an existing company app or CMS (WordPress, React portal), your styles will bleed into everything else, breaking unrelated navigation bars and buttons.`,
      architecturalImpact: 
        `Unscoped global specificity hazard. Causes CSS cascade collisions with host application reset sheets, component libraries, and third-party widgets. Needs namespace scoping, CSS @layer, or :where() resets.`,
      mockArtifactSnippet: 'body { margin: 0; background: #000; } button { background: blue; }',
      prodHardenedSnippet: '@layer studio-components { .app-container { ... } .app-btn { ... } }',
      severity: 'high',
      autoFixAvailable: true,
    });
  }

  // Calculate Production Readiness Score (0 to 100)
  let penalty = 0;
  risks.forEach(r => {
    if (r.severity === 'critical') penalty += 35;
    else if (r.severity === 'high') penalty += 20;
    else penalty += 10;
  });
  const score = Math.max(15, 100 - penalty);

  const status: 'mock-prototype' | 'partially-hardened' | 'production-ready' = 
    score >= 90 ? 'production-ready' : score >= 60 ? 'partially-hardened' : 'mock-prototype';

  const summaryPlainEnglish = score >= 90
    ? 'Outstanding! Your stylesheet uses fluid formulas, mobile safe-areas, and CPU-friendly compositing ready for real-world devices.'
    : score >= 60
    ? 'Moderate Production Readiness. The layout works on common screens, but mobile address bars or fixed pixel widths may cause glitches for some users.'
    : 'Mock Prototype Detected. This CSS relies on ideal desktop canvas assumptions. On real mobile devices and budget hardware, users will encounter cut-offs or lag.';

  const summaryArchitect = score >= 90
    ? 'Production Grade: Fully hardened against CLS, dynamic mobile viewport jitter, and rendering thread starvation. Ready for multi-tenant deployment.'
    : score >= 60
    ? 'Pre-Production Grade: Secondary viewport resilience and compositor optimizations required prior to canary or edge rollout.'
    : 'Prototype Grade: High regression hazard. Unmitigated fixed pixel boundaries and viewport height traps will produce client-side layout failures.';

  return {
    score,
    status,
    risks,
    summaryPlainEnglish,
    summaryArchitect,
    metrics: {
      fixedPixelCount,
      viewportHeightTrapCount,
      unprotectedOverflowCount,
      heavyFilterCount,
      missingSafeAreaCount,
    }
  };
}

/**
 * Automatically hardens mock CSS for production
 */
export function hardenMockForProduction(css: string): { 
  hardenedCss: string; 
  transformedCount: number; 
  appliedTransforms: string[] 
} {
  let transformed = css;
  const applied: string[] = [];
  let count = 0;

  // 1. Replace 100vh with dynamic viewport height (100dvh with 100vh fallback)
  if (/100vh/i.test(transformed) && !/100dvh/i.test(transformed)) {
    transformed = transformed.replace(
      /(min-height|height):\s*100vh;/gi,
      '$1: 100vh;\n  $1: 100dvh; /* Mobile dynamic address-bar resilient */'
    );
    applied.push('Upgraded rigid 100vh to dynamic viewport height (100dvh)');
    count++;
  }

  // 2. Harden fixed pixel container widths (e.g. width: 1200px)
  const wideWidthRegex = /(width|min-width):\s*(\d{3,4})px;/gi;
  if (wideWidthRegex.test(transformed)) {
    transformed = transformed.replace(wideWidthRegex, (m, prop, valStr) => {
      const val = parseInt(valStr, 10);
      if (val >= 480) {
        count++;
        return `max-width: min(${val}px, 100% - 2rem); width: 100%; margin-inline: auto;`;
      }
      return m;
    });
    applied.push('Converted hardcoded desktop widths to fluid container bounds');
  }

  // 3. Add Safe-Area-Inset padding to fixed headers/footers if missing
  if (/(position:\s*fixed|position:\s*sticky)/i.test(transformed) && !/env\(\s*safe-area-inset/i.test(transformed)) {
    // Add safe-area padding rules
    if (/bottom:\s*0/i.test(transformed)) {
      transformed = transformed.replace(
        /(bottom:\s*0;)/gi,
        '$1\n  padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));'
      );
      applied.push('Injected iOS/Android home-gesture safe-area inset (env(safe-area-inset-bottom))');
      count++;
    }
    if (/top:\s*0/i.test(transformed)) {
      transformed = transformed.replace(
        /(top:\s*0;)/gi,
        '$1\n  padding-top: max(1rem, env(safe-area-inset-top, 1rem));'
      );
      applied.push('Injected camera notch safe-area inset (env(safe-area-inset-top))');
      count++;
    }
  }

  // 4. Harden heavy backdrop filters with low-power reduced-transparency fallback
  if (/backdrop-filter:\s*blur\((\d+)px\)/i.test(transformed) && !/prefers-reduced-transparency/i.test(transformed)) {
    transformed = transformed + `\n\n/* Low-Power CPU & Accessibility Compositor Guard */\n@media (prefers-reduced-transparency: reduce) {\n  * {\n    backdrop-filter: none !important;\n    -webkit-backdrop-filter: none !important;\n  }\n}\n`;
    applied.push('Added prefers-reduced-transparency CPU compositor guard for low-end devices');
    count++;
  }

  // 5. Ensure box-sizing: border-box is applied if missing
  if (!/box-sizing/i.test(transformed)) {
    transformed = `*, *::before, *::after {\n  box-sizing: border-box;\n}\n\n` + transformed;
    applied.push('Injected universal box-sizing: border-box to prevent padding overflow blowouts');
    count++;
  }

  return {
    hardenedCss: transformed,
    transformedCount: count,
    appliedTransforms: applied
  };
}
