/**
 * Regex-Based Production CSS Minifier & Compression Engine
 * Reduces stylesheet file size for high-performance production delivery
 * while strictly preserving CSS semantics, calculations, strings, and URLs.
 */

export interface MinifyOptions {
  stripComments?: boolean;
  shortenZeroUnits?: boolean;
  removeTrailingSemicolons?: boolean;
  preserveCalcSpacing?: boolean;
}

export interface MinifyResult {
  minifiedCss: string;
  originalBytes: number;
  minifiedBytes: number;
  savedBytes: number;
  savingsPercentage: number;
  originalLines: number;
  minifiedLines: number;
  reductionRatio: string;
}

/**
 * Calculates byte size of a UTF-8 string
 */
export function getByteLength(str: string): number {
  if (typeof Blob !== 'undefined') {
    return new Blob([str]).size;
  }
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return str.length;
}

/**
 * Minify CSS using an optimized regex-based multi-pass compressor
 */
export function minifyCss(css: string, options: MinifyOptions = {}): MinifyResult {
  const {
    stripComments = true,
    shortenZeroUnits = true,
    removeTrailingSemicolons = true,
    preserveCalcSpacing = true,
  } = options;

  if (!css || typeof css !== 'string') {
    return {
      minifiedCss: '',
      originalBytes: 0,
      minifiedBytes: 0,
      savedBytes: 0,
      savingsPercentage: 0,
      originalLines: 0,
      minifiedLines: 0,
      reductionRatio: '0.0x',
    };
  }

  const originalBytes = getByteLength(css);
  const originalLines = css.split('\n').length;

  // Pass 1: Stash strings, character escapes, and url(...) calls to protect them from regex alteration
  const tokens: string[] = [];
  let working = css.replace(
    /("(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'|url\((?:[^)]+)\))/gi,
    (match) => {
      const placeholder = `___CSS_MIN_TOKEN_${tokens.length}___`;
      tokens.push(match);
      return placeholder;
    }
  );

  // Pass 2: Strip standard CSS multi-line comments
  if (stripComments) {
    working = working.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // Pass 3: Normalize newlines, carriage returns, tabs, and runs of whitespace
  working = working.replace(/\s+/g, ' ');

  // Pass 4: Remove whitespace around structural punctuation { } ; ,
  working = working.replace(/\s*([{};,])\s*/g, '$1');

  // Pass 5: Remove space around child & sibling combinators (> and ~)
  working = working.replace(/\s*([>~])\s*/g, '$1');

  // Pass 6: Remove space after colons in property declarations
  // Matches declaration format like "property: value" without affecting pseudo-elements like "::before"
  working = working.replace(/([a-zA-Z0-9_-]+)\s*:\s*/g, '$1:');

  // Pass 7: Remove space inside parentheses e.g. rgb( 255 , 0 , 0 ) -> rgb(255,0,0)
  working = working.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');

  // Pass 8: Re-preserve required spaces inside calc(), clamp(), min(), max() around + and -
  // CSS Values & Units Level 3 specification strictly requires spaces around '+' and '-' in calc()
  if (preserveCalcSpacing) {
    working = working.replace(/(?:calc|clamp|min|max)\(([^)]+)\)/gi, (match, inner) => {
      const fixedInner = inner.replace(
        /([0-9a-zA-Z%_)-])\s*([+-])\s*([0-9a-zA-Z%_(])/g,
        '$1 $2 $3'
      );
      return match.replace(inner, fixedInner);
    });
  }

  // Pass 9: Remove trailing semicolons before closing brackets
  if (removeTrailingSemicolons) {
    working = working.replace(/;+\}/g, '}');
  }

  // Pass 10: Deduplicate redundant semicolons
  working = working.replace(/;{2,}/g, ';');

  // Pass 11: Optimize zero unit dimensions (e.g., 0px -> 0, 0rem -> 0)
  if (shortenZeroUnits) {
    // Only shorten when preceded by non-digit or boundary, not inside keyframe percentages (e.g. 0% { ... })
    working = working.replace(/(?<!\d)0(px|em|rem|cm|mm|in|pt|pc)(?=[; ,}!])/gi, '0');
  }

  // Pass 12: Remove empty CSS rulesets (e.g. .empty-class {})
  working = working.replace(/[^{}]+\{\s*\}/g, '');

  // Pass 13: Restore stashed tokens (strings & URLs)
  working = working.replace(/___CSS_MIN_TOKEN_(\d+)___/g, (_, id) => {
    return tokens[parseInt(id, 10)] || '';
  });

  const minifiedCss = working.trim();
  const minifiedBytes = getByteLength(minifiedCss);
  const savedBytes = Math.max(0, originalBytes - minifiedBytes);
  const savingsPercentage = originalBytes > 0
    ? parseFloat(((savedBytes / originalBytes) * 100).toFixed(1))
    : 0;
  const minifiedLines = minifiedCss.length > 0 ? minifiedCss.split('\n').length : 0;
  const reductionRatio = minifiedBytes > 0
    ? `${(originalBytes / minifiedBytes).toFixed(1)}x`
    : '1.0x';

  return {
    minifiedCss,
    originalBytes,
    minifiedBytes,
    savedBytes,
    savingsPercentage,
    originalLines,
    minifiedLines,
    reductionRatio,
  };
}

/**
 * Unminifies / beautifies CSS with consistent 2-space indentation
 */
export function formatCss(css: string): string {
  if (!css || typeof css !== 'string') return '';

  // Stash strings and url() calls
  const tokens: string[] = [];
  let str = css.replace(
    /("(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'|url\((?:[^)]+)\))/gi,
    (match) => {
      const placeholder = `___CSS_FMT_TOKEN_${tokens.length}___`;
      tokens.push(match);
      return placeholder;
    }
  );

  // Normalize single line spaces
  str = str.replace(/\s+/g, ' ').trim();

  let formatted = '';
  let indentLevel = 0;
  const indent = '  ';
  let inRule = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === '{') {
      formatted = formatted.trimEnd() + ' {\n';
      indentLevel++;
      formatted += indent.repeat(indentLevel);
      inRule = true;
    } else if (char === '}') {
      formatted = formatted.trimEnd() + '\n';
      indentLevel = Math.max(0, indentLevel - 1);
      formatted += indent.repeat(indentLevel) + '}\n\n' + indent.repeat(indentLevel);
      inRule = indentLevel > 0;
    } else if (char === ';') {
      formatted += ';\n' + indent.repeat(indentLevel);
    } else if (char === ':' && inRule && str[i + 1] !== ':' && str[i - 1] !== ':') {
      formatted += ': ';
    } else {
      formatted += char;
    }
  }

  // Restore stashed tokens
  formatted = formatted.replace(/___CSS_FMT_TOKEN_(\d+)___/g, (_, id) => {
    return tokens[parseInt(id, 10)] || '';
  });

  return formatted.trim() + '\n';
}
