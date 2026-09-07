import { CpuMetrics, CpuMode } from '../types';

export function analyzeCpuMetrics(css: string, activeMode: CpuMode = 'auto'): CpuMetrics {
  const concurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const deviceMemoryGb = typeof navigator !== 'undefined' ? (navigator as any).deviceMemory || 8 : 8;

  // Detect heavy CSS properties
  const heavyProps: CpuMetrics['heavyPropertiesFound'] = [];

  // 1. Backdrop filters
  const blurMatches = css.match(/backdrop-filter:\s*blur\([^)]+\)/gi);
  if (blurMatches && blurMatches.length > 0) {
    heavyProps.push({
      property: 'backdrop-filter: blur()',
      count: blurMatches.length,
      impact: blurMatches.length > 2 ? 'high' : 'medium',
      suggestion: 'Consumes GPU raster fill-rate; in low-power mode, fallback to high-opacity solid color rgba()',
    });
  }

  // 2. Box shadow cascades
  const shadowMatches = css.match(/box-shadow:\s*[^;]+;/gi);
  let multiLayerShadows = 0;
  if (shadowMatches) {
    shadowMatches.forEach(s => {
      const commas = (s.match(/,/g) || []).length;
      if (commas >= 2) multiLayerShadows++;
    });
  }
  if (multiLayerShadows > 0) {
    heavyProps.push({
      property: 'Multi-layer Box Shadows',
      count: multiLayerShadows,
      impact: 'medium',
      suggestion: 'Multi-stop shadows require repeated CPU/GPU paint passes; replace with 1px border or single 4px shadow in power-saver mode',
    });
  }

  // 3. Layout reflow transitions (width, height, margin, padding, top, left)
  const reflowMatches = css.match(/transition:\s*[^;]*(width|height|top|left|margin|padding)[^;]*/gi);
  if (reflowMatches && reflowMatches.length > 0) {
    heavyProps.push({
      property: 'Non-composited Geometry Transitions',
      count: reflowMatches.length,
      impact: 'high',
      suggestion: 'Forces document layout calculation on every frame. Offload to transform & opacity.',
    });
  }

  // 4. Infinite animations
  const infiniteAnim = css.match(/animation:\s*[^;]*infinite[^;]*/gi);
  if (infiniteAnim && infiniteAnim.length > 0) {
    heavyProps.push({
      property: 'Infinite Keyframe Loops',
      count: infiniteAnim.length,
      impact: infiniteAnim.length > 1 ? 'high' : 'low',
      suggestion: 'Causes continuous CPU wake-ups; throttle or pause when off-screen or in low-power mode.',
    });
  }

  // Calculate score
  let score = 98;
  heavyProps.forEach(p => {
    if (p.impact === 'high') score -= 18 * p.count;
    if (p.impact === 'medium') score -= 10 * p.count;
    if (p.impact === 'low') score -= 5 * p.count;
  });

  // Hardware adjustment
  if (concurrency <= 2) score -= 15;
  if (deviceMemoryGb <= 2) score -= 10;

  const finalScore = Math.max(15, Math.min(100, score));

  // Determine if battery saving / low-power should be automatically active
  const isBatterySaving =
    activeMode === 'low-power' ||
    (activeMode === 'auto' && (concurrency <= 2 || finalScore < 60));

  const estimatedFps = isBatterySaving ? 60 : (finalScore >= 80 ? 60 : finalScore >= 55 ? 45 : 30);
  const paintCostMs = parseFloat(((100 - finalScore) * 0.15 + 1.2).toFixed(1));

  return {
    concurrency,
    deviceMemoryGb,
    isBatterySaving,
    estimatedFps,
    paintCostMs,
    heavyPropertiesFound: heavyProps,
    overallScore: finalScore,
  };
}

export function generateCpuAdaptiveCss(originalCss: string, mode: CpuMode): string {
  if (mode === 'high') {
    return originalCss;
  }

  let optimized = originalCss;

  if (mode === 'low-power' || mode === 'auto') {
    // 1. Simplify or remove backdrop-filter
    optimized = optimized.replace(/backdrop-filter:\s*blur\([^)]+\);?/gi, '/* Low-CPU: blur removed */\n  backdrop-filter: none;\n  background: var(--surface, #1e293b);');
    
    // 2. Reduce multi-layer box shadows to subtle 1px border or single flat shadow
    optimized = optimized.replace(/box-shadow:\s*[^;]+;/gi, 'box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* Low-CPU single pass */');
    
    // 3. Pause infinite loops if requested or add prefers-reduced-motion
    optimized += `\n\n/* CPU Adaptation: Battery Saver & Low Core Fallbacks */\n@media (prefers-reduced-motion: reduce), (update: slow) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}`;
  }

  return optimized;
}
