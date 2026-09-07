/**
 * High-Performance CSS Variable Extractor & Live Override Engine
 * Features:
 * - Low-latency parsing with in-memory memoized cache
 * - Automatic categorization (color, spacing, typography, function/clamp, number)
 * - Reference usage tracking (counts var(--name) calls across stylesheet)
 * - Safe AST-like regex replacement that updates CSS globally
 * - LocalStorage persistence for user custom overrides & presets
 */

import { ExtractedCssVariable, CssVariableCategory } from '../types';

const STORAGE_KEY_OVERRIDES = 'css_studio_tokens_overrides_v1';
const STORAGE_KEY_PRESETS = 'css_studio_tokens_saved_presets_v1';

// In-memory cache for ultra-low latency parsing
const parseCache = new Map<string, { hash: string; result: ExtractedCssVariable[] }>();

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(str.length, 2000); i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `${str.length}_${hash}`;
}

const COLOR_NAMES = new Set([
  'transparent', 'currentcolor', 'black', 'white', 'slate', 'gray', 'red', 'orange',
  'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue',
  'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'none'
]);

/**
 * Detects the variable's visual category based on value pattern
 */
export function detectVariableCategory(value: string, name: string): CssVariableCategory {
  const cleanVal = value.trim().toLowerCase();
  const cleanName = name.toLowerCase();

  // Functions (clamp, calc, min, max)
  if (/^(clamp|calc|min|max|env)\s*\(/.test(cleanVal) || cleanVal.includes('clamp(')) {
    return 'function';
  }

  // Colors
  if (
    cleanVal.startsWith('#') ||
    /^(rgb|rgba|hsl|hsla|oklch|oklab|lch|lab|color-mix)\s*\(/.test(cleanVal) ||
    COLOR_NAMES.has(cleanVal) ||
    cleanName.includes('color') ||
    cleanName.includes('bg') ||
    cleanName.includes('border') ||
    cleanName.includes('surface') ||
    cleanName.includes('text-color') ||
    cleanName.includes('brand')
  ) {
    return 'color';
  }

  // Dimensions / Spacing
  if (
    /\d+(\.\d+)?(px|rem|em|%|vh|vw|dvh|svh|lvh|ch|vmin|vmax|fr)\b/.test(cleanVal) ||
    cleanName.includes('space') ||
    cleanName.includes('gap') ||
    cleanName.includes('padding') ||
    cleanName.includes('margin') ||
    cleanName.includes('width') ||
    cleanName.includes('height') ||
    cleanName.includes('radius') ||
    cleanName.includes('inset')
  ) {
    return 'spacing';
  }

  // Typography
  if (
    cleanName.includes('font') ||
    cleanVal.includes('sans-serif') ||
    cleanVal.includes('monospace') ||
    cleanVal.includes('serif') ||
    cleanVal.includes('system-ui') ||
    /['"][a-zA-Z\s]+['"]/.test(cleanVal)
  ) {
    return 'typography';
  }

  // Unitless Numbers (opacity, z-index, line-height, flex-grow)
  if (/^-?\d+(\.\d+)?$/.test(cleanVal)) {
    return 'number';
  }

  return 'other';
}

/**
 * Extracts all CSS variables defined or referenced in the active stylesheet
 */
export function extractCssVariables(css: string): ExtractedCssVariable[] {
  if (!css || typeof css !== 'string') return [];

  const cacheKey = simpleHash(css);
  const cached = parseCache.get(cacheKey);
  if (cached) {
    return cached.result;
  }

  const variablesMap = new Map<string, ExtractedCssVariable>();
  const lines = css.split('\n');

  // Step 1: Count references of var(--*) across the CSS
  const usageCounts = new Map<string, number>();
  const varRefRegex = /var\(\s*(--[a-zA-Z0-9-_]+)(?:\s*,\s*([^)]+))?\s*\)/g;
  let refMatch: RegExpExecArray | null;

  while ((refMatch = varRefRegex.exec(css)) !== null) {
    const varName = refMatch[1];
    const fallback = refMatch[2]?.trim();
    usageCounts.set(varName, (usageCounts.get(varName) || 0) + 1);

    // If not yet declared, register as referenced variable with fallback
    if (!variablesMap.has(varName)) {
      const detectedVal = fallback || '';
      variablesMap.set(varName, {
        name: varName,
        value: detectedVal,
        scope: ':root (implicit)',
        category: detectVariableCategory(detectedVal, varName),
        isDeclared: false,
        fallbackValue: fallback,
        usageCount: 0,
      });
    }
  }

  // Step 2: Track active selectors & parse declared variables (--name: value;)
  let currentScope = ':root';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check selector boundary
    const openBraceIdx = line.indexOf('{');
    if (openBraceIdx !== -1) {
      const potentialSelector = line.slice(0, openBraceIdx).trim();
      if (potentialSelector) {
        currentScope = potentialSelector;
      }
    }

    if (line.includes('}')) {
      // Return to global scope if block closed
      currentScope = ':root';
    }

    // Match CSS custom property declarations: --foo: bar;
    const declMatch = line.match(/^\s*(--[a-zA-Z0-9-_]+)\s*:\s*([^;!}]+)(?:!important)?;/);
    if (declMatch) {
      const name = declMatch[1].trim();
      const value = declMatch[2].trim();

      variablesMap.set(name, {
        name,
        value,
        scope: currentScope,
        lineNumber: i + 1,
        category: detectVariableCategory(value, name),
        isDeclared: true,
        usageCount: usageCounts.get(name) || 0,
        rawDeclaration: line.trim(),
      });
    }
  }

  // Finalize usage counts on all variables
  for (const [name, variable] of variablesMap.entries()) {
    variable.usageCount = usageCounts.get(name) || 0;
  }

  const result = Array.from(variablesMap.values());

  // Sort: Declared first, then by usage count descending, then alphabetical
  result.sort((a, b) => {
    if (a.isDeclared !== b.isDeclared) return a.isDeclared ? -1 : 1;
    if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
    return a.name.localeCompare(b.name);
  });

  // Keep cache size bounded (max 20 entries)
  if (parseCache.size > 20) {
    const firstKey = parseCache.keys().next().value;
    if (firstKey) parseCache.delete(firstKey);
  }
  parseCache.set(cacheKey, { hash: cacheKey, result });

  return result;
}

/**
 * Globally updates a CSS variable's value inside the active stylesheet
 */
export function updateCssVariableInStylesheet(
  css: string,
  varName: string,
  newValue: string
): string {
  const escapedName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Check if declared explicitly: --varName: <value>;
  const declRegex = new RegExp(`^(\\s*${escapedName}\\s*:\\s*)([^;!]+)(;?)`, 'm');

  if (declRegex.test(css)) {
    return css.replace(declRegex, `$1${newValue}$3`);
  }

  // If not declared, check if :root exists to append inside it
  const rootBlockRegex = /(:root\s*\{)([\s\S]*?)(\})/;
  if (rootBlockRegex.test(css)) {
    return css.replace(rootBlockRegex, (match, p1, p2, p3) => {
      // Check if already in :root
      if (p2.includes(varName)) {
        const innerRegex = new RegExp(`(${escapedName}\\s*:\\s*)([^;!]+)(;?)`);
        return `${p1}${p2.replace(innerRegex, `$1${newValue}$3`)}${p3}`;
      }
      return `${p1}\n  ${varName}: ${newValue};${p2}${p3}`;
    });
  }

  // If no :root exists at all, prepend a :root block with the new variable
  return `:root {\n  ${varName}: ${newValue};\n}\n\n${css}`;
}

/**
 * Adds a brand-new CSS variable into the active stylesheet's :root block
 */
export function addCssVariableToStylesheet(
  css: string,
  varName: string,
  value: string
): string {
  const formattedName = varName.startsWith('--') ? varName : `--${varName}`;
  return updateCssVariableInStylesheet(css, formattedName, value);
}

/**
 * Exports all current variables formatted as a production :root declaration
 */
export function generateRootSnippet(variables: ExtractedCssVariable[]): string {
  const lines = [':root {'];

  const categories: { label: string; cat: CssVariableCategory }[] = [
    { label: 'Colors & Semantic Surfaces', cat: 'color' },
    { label: 'Fluid Scales & Functions', cat: 'function' },
    { label: 'Spacing & Dimensions', cat: 'spacing' },
    { label: 'Typography', cat: 'typography' },
    { label: 'Numerical & Compositing', cat: 'number' },
    { label: 'Other Design Tokens', cat: 'other' },
  ];

  for (const { label, cat } of categories) {
    const items = variables.filter((v) => v.category === cat);
    if (items.length > 0) {
      lines.push(`  /* ${label} */`);
      for (const item of items) {
        lines.push(`  ${item.name}: ${item.value};`);
      }
      lines.push('');
    }
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Persistence: LocalStorage helpers
 */
export function persistTokenOverrides(overrides: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));
  } catch (err) {
    console.warn('Unable to persist token overrides to localStorage:', err);
  }
}

export function loadPersistedTokenOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Unable to load token overrides from localStorage:', err);
  }
  return {};
}

export function clearPersistedTokenOverrides(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_OVERRIDES);
  } catch (err) {
    console.warn('Unable to clear token overrides from localStorage:', err);
  }
}
