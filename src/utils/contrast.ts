/**
 * WCAG 2.1 Contrast & Color Utility
 */

export interface ContrastResult {
  ratio: number;
  ratioString: string;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  level: 'AAA' | 'AA' | 'Fail';
}

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) {
    return [0, 0, 0];
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getChannelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const R = getChannelLuminance(r);
  const G = getChannelLuminance(g);
  const B = getChannelLuminance(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function calculateContrast(foregroundHex: string, backgroundHex: string): ContrastResult {
  const l1 = getLuminance(foregroundHex);
  const l2 = getLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  const rounded = Math.round(ratio * 100) / 100;
  const aaNormal = rounded >= 4.5;
  const aaLarge = rounded >= 3.0;
  const aaaNormal = rounded >= 7.0;
  const aaaLarge = rounded >= 4.5;

  let level: 'AAA' | 'AA' | 'Fail' = 'Fail';
  if (aaaNormal) level = 'AAA';
  else if (aaNormal) level = 'AA';

  return {
    ratio: rounded,
    ratioString: `${rounded.toFixed(2)}:1`,
    aaNormal,
    aaLarge,
    aaaNormal,
    aaaLarge,
    level,
  };
}

// Generates adjusted hex to meet AA 4.5:1
export function suggestAccessibleColor(fgHex: string, bgHex: string, targetRatio = 4.5): string {
  const bgLum = getLuminance(bgHex);
  const isDarkBg = bgLum < 0.5;
  const [r, g, b] = hexToRgb(fgHex);
  
  let currentR = r;
  let currentG = g;
  let currentB = b;

  for (let step = 0; step < 25; step++) {
    const hex = `#${[currentR, currentG, currentB].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
    const result = calculateContrast(hex, bgHex);
    if (result.ratio >= targetRatio) {
      return hex;
    }
    if (isDarkBg) {
      currentR += 10;
      currentG += 10;
      currentB += 10;
    } else {
      currentR -= 10;
      currentG -= 10;
      currentB -= 10;
    }
  }
  return isDarkBg ? '#ffffff' : '#111827';
}
