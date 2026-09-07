/**
 * Real-time CSS Linter & Quality Engine
 * Validates syntax, brace balancing, semicolons, unknown properties,
 * responsive bottlenecks, GPU performance, and modern CSS standards.
 */

export type LintSeverity = 'error' | 'warning' | 'suggestion';
export type LintCategory = 'syntax' | 'responsive' | 'performance' | 'a11y' | 'modern-css';

export interface LintQuickFix {
  label: string;
  apply: (css: string) => string;
}

export interface LintIssue {
  id: string;
  line: number;
  column: number;
  length?: number;
  severity: LintSeverity;
  category: LintCategory;
  rule: string;
  message: string;
  suggestion: string;
  quickFix?: LintQuickFix;
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
  suggestionCount: number;
  healthScore: number; // 0 to 100
}

// Comprehensive standard CSS properties set
const VALID_CSS_PROPERTIES = new Set([
  // Layout & Box Model
  'display', 'position', 'top', 'right', 'bottom', 'left', 'inset', 'inset-block', 'inset-inline',
  'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
  'inline-size', 'min-inline-size', 'max-inline-size', 'block-size', 'min-block-size', 'max-block-size',
  'box-sizing', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-block-start', 'margin-block-end', 'margin-inline', 'margin-inline-start', 'margin-inline-end',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-block', 'padding-block-start', 'padding-block-end', 'padding-inline', 'padding-inline-start', 'padding-inline-end',
  'overflow', 'overflow-x', 'overflow-y', 'overflow-wrap', 'overflow-clip-margin', 'overscroll-behavior', 'overscroll-behavior-x', 'overscroll-behavior-y',
  'z-index', 'float', 'clear', 'visibility', 'opacity',

  // Flexbox & Grid
  'flex', 'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow', 'flex-shrink', 'flex-wrap',
  'order', 'gap', 'row-gap', 'column-gap',
  'grid', 'grid-area', 'grid-auto-columns', 'grid-auto-flow', 'grid-auto-rows',
  'grid-column', 'grid-column-end', 'grid-column-start', 'grid-row', 'grid-row-end', 'grid-row-start',
  'grid-template', 'grid-template-areas', 'grid-template-columns', 'grid-template-rows',
  'align-content', 'align-items', 'align-self', 'justify-content', 'justify-items', 'justify-self',
  'place-content', 'place-items', 'place-self',

  // Typography & Text
  'color', 'font', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style',
  'font-variant', 'font-variant-caps', 'font-weight', 'line-height', 'letter-spacing', 'word-spacing',
  'text-align', 'text-align-last', 'text-decoration', 'text-decoration-color', 'text-decoration-line',
  'text-decoration-style', 'text-decoration-thickness', 'text-indent', 'text-overflow', 'text-shadow',
  'text-transform', 'white-space', 'word-break', 'hyphens', 'writing-mode', 'direction',

  // Backgrounds & Borders
  'background', 'background-attachment', 'background-blend-mode', 'background-clip', 'background-color',
  'background-image', 'background-origin', 'background-position', 'background-position-x', 'background-position-y',
  'background-repeat', 'background-size',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-block', 'border-inline', 'border-color', 'border-style', 'border-width',
  'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
  'border-collapse', 'border-spacing', 'border-image', 'outline', 'outline-color', 'outline-offset',
  'outline-style', 'outline-width', 'box-shadow',

  // Transforms & Animations
  'transform', 'transform-origin', 'transform-style', 'perspective', 'perspective-origin', 'backface-visibility',
  'translate', 'rotate', 'scale',
  'transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay',
  'animation', 'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay',
  'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state',
  'will-change',

  // Visual Effects & Filters
  'filter', 'backdrop-filter', 'mix-blend-mode', 'clip-path', 'mask', 'mask-image', 'mask-size', 'mask-position',
  'aspect-ratio', 'object-fit', 'object-position', 'cursor', 'pointer-events', 'user-select', 'touch-action',
  'contain', 'content-visibility', 'accent-color', 'color-scheme', 'scrollbar-gutter', 'scrollbar-width',
  'scroll-behavior', 'scroll-snap-type', 'scroll-snap-align', 'scroll-padding', 'scroll-margin',
  'content', 'quotes', 'counter-reset', 'counter-increment', 'appearance', '-webkit-appearance'
]);

// Common typos and their fixes
const COMMON_TYPOS: Record<string, string> = {
  'colr': 'color',
  'colour': 'color',
  'clor': 'color',
  'pading': 'padding',
  'paddng': 'padding',
  'pad': 'padding',
  'margn': 'margin',
  'maring': 'margin',
  'widht': 'width',
  'witdh': 'width',
  'heigth': 'height',
  'hight': 'height',
  'dispaly': 'display',
  'disply': 'display',
  'positin': 'position',
  'bacground': 'background',
  'backgroud': 'background',
  'bg': 'background',
  'backgorund': 'background',
  'font-famly': 'font-family',
  'font-famyly': 'font-family',
  'font-weigth': 'font-weight',
  'text-algn': 'text-align',
  'text-alignement': 'text-align',
  'z-idex': 'z-index',
  'zindex': 'z-index',
  'border-radus': 'border-radius',
  'border-raduis': 'border-radius',
  'raduis': 'border-radius',
  'transfrom': 'transform',
  'trasform': 'transform',
  'transitio': 'transition',
  'opactiy': 'opacity',
  'opcity': 'opacity',
  'curser': 'cursor',
  'flex-drirection': 'flex-direction',
  'flex-dir': 'flex-direction',
  'align-item': 'align-items',
  'justify-contnet': 'justify-content',
  'gap-x': 'column-gap',
  'gap-y': 'row-gap',
};

// Levenshtein distance for fuzzy matching typos
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function findCloseProperty(prop: string): string | null {
  if (COMMON_TYPOS[prop]) return COMMON_TYPOS[prop];

  let bestMatch: string | null = null;
  let bestDistance = 3; // only suggest if distance <= 2

  for (const valid of VALID_CSS_PROPERTIES) {
    if (Math.abs(valid.length - prop.length) > 2) continue;
    const dist = levenshteinDistance(prop, valid);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = valid;
    }
  }
  return bestMatch;
}

/**
 * Main CSS Linting function that analyzes the stylesheet
 */
export function lintCss(css: string): LintResult {
  const issues: LintIssue[] = [];
  const lines = css.split('\n');

  let braceDepth = 0;
  const unclosedBraceStack: { line: number; column: number; selector: string }[] = [];
  let inComment = false;
  let currentSelector = '';

  // Pass 1: Line by line scanning for syntax & declarations
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNumber = lineIdx + 1;
    const line = lines[lineIdx];
    const trimmed = line.trim();

    // Comment handling
    if (inComment) {
      if (trimmed.includes('*/')) {
        inComment = false;
      }
      continue;
    }

    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) {
        inComment = true;
      }
      continue;
    }

    if (!trimmed) continue;

    // Track braces
    for (let colIdx = 0; colIdx < line.length; colIdx++) {
      const char = line[colIdx];
      if (char === '{') {
        braceDepth++;
        unclosedBraceStack.push({
          line: lineNumber,
          column: colIdx + 1,
          selector: currentSelector || 'unnamed rule'
        });
        currentSelector = '';
      } else if (char === '}') {
        braceDepth--;
        if (unclosedBraceStack.length > 0) {
          unclosedBraceStack.pop();
        } else {
          // Unexpected closing brace!
          issues.push({
            id: `syntax-unexpected-brace-${lineNumber}`,
            line: lineNumber,
            column: colIdx + 1,
            severity: 'error',
            category: 'syntax',
            rule: 'no-unexpected-closing-brace',
            message: 'Unexpected closing brace `}` with no corresponding opening `{`.',
            suggestion: 'Remove the redundant closing brace or check block nesting.',
            quickFix: {
              label: 'Remove extra `}`',
              apply: (fullCss) => {
                const arr = fullCss.split('\n');
                arr[lineIdx] = arr[lineIdx].replace('}', '');
                return arr.join('\n');
              }
            }
          });
        }
      }
    }

    // Capture selector if outside a block
    if (braceDepth === 0 && !trimmed.endsWith('}')) {
      currentSelector = trimmed.replace('{', '').trim();
    }

    // Check for unclosed single or double quotes
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 && !line.includes('/*')) {
      issues.push({
        id: `syntax-unclosed-quote-${lineNumber}`,
        line: lineNumber,
        column: line.indexOf("'") + 1,
        severity: 'error',
        category: 'syntax',
        rule: 'no-unclosed-string',
        message: 'Unclosed single quote detected.',
        suggestion: 'Close the string with a matching single quote.',
        quickFix: {
          label: "Append closing quote '",
          apply: (fullCss) => {
            const arr = fullCss.split('\n');
            arr[lineIdx] = arr[lineIdx] + "'";
            return arr.join('\n');
          }
        }
      });
    }
    if (doubleQuotes % 2 !== 0 && !line.includes('/*')) {
      issues.push({
        id: `syntax-unclosed-dquote-${lineNumber}`,
        line: lineNumber,
        column: line.indexOf('"') + 1,
        severity: 'error',
        category: 'syntax',
        rule: 'no-unclosed-string',
        message: 'Unclosed double quote detected.',
        suggestion: 'Close the string with a matching double quote.',
        quickFix: {
          label: 'Append closing quote "',
          apply: (fullCss) => {
            const arr = fullCss.split('\n');
            arr[lineIdx] = arr[lineIdx] + '"';
            return arr.join('\n');
          }
        }
      });
    }

    // Check for unclosed parentheses in functions (calc, var, clamp, rgb, url)
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    if (openParens > closeParens && !line.includes('/*')) {
      issues.push({
        id: `syntax-unclosed-paren-${lineNumber}`,
        line: lineNumber,
        column: line.lastIndexOf('(') + 1,
        severity: 'error',
        category: 'syntax',
        rule: 'no-unclosed-parentheses',
        message: `Missing closing parenthesis ` + ')` in function expression.',
        suggestion: 'Ensure all `calc()`, `var()`, `clamp()`, or `rgba()` functions are properly closed.',
        quickFix: {
          label: 'Append closing `)`',
          apply: (fullCss) => {
            const arr = fullCss.split('\n');
            arr[lineIdx] = arr[lineIdx].replace(/;?$/, ');');
            return arr.join('\n');
          }
        }
      });
    }

    // Declarations checking (inside a rule block)
    if (braceDepth > 0 && trimmed.length > 0 && !trimmed.startsWith('@') && !trimmed.startsWith('/*')) {
      // Check for missing semicolon if line looks like a declaration and isn't closing brace
      if (!trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx > 0) {
          issues.push({
            id: `syntax-missing-semicolon-${lineNumber}`,
            line: lineNumber,
            column: line.length + 1,
            severity: 'error',
            category: 'syntax',
            rule: 'declaration-missing-semicolon',
            message: `Declaration is missing a terminating semicolon ';'.`,
            suggestion: 'Add a semicolon `;` at the end of the property declaration.',
            quickFix: {
              label: 'Add semicolon `;`',
              apply: (fullCss) => {
                const arr = fullCss.split('\n');
                arr[lineIdx] = arr[lineIdx].trimEnd() + ';';
                return arr.join('\n');
              }
            }
          });
        }
      }

      // Check for unknown or misspelled CSS property
      const declMatch = trimmed.match(/^([a-zA-Z0-9_\-]+)\s*:\s*(.*)/);
      if (declMatch) {
        const rawProp = declMatch[1].toLowerCase();
        const rawVal = declMatch[2].replace(/;$/, '').trim();

        // If it's a CSS custom property (e.g. --brand-color), it's valid
        if (!rawProp.startsWith('--')) {
          if (!VALID_CSS_PROPERTIES.has(rawProp) && !rawProp.startsWith('-webkit-') && !rawProp.startsWith('-moz-')) {
            const suggestedProp = findCloseProperty(rawProp);
            issues.push({
              id: `syntax-unknown-property-${lineNumber}`,
              line: lineNumber,
              column: line.indexOf(declMatch[1]) + 1,
              length: rawProp.length,
              severity: 'error',
              category: 'syntax',
              rule: 'property-no-unknown',
              message: `Unknown or misspelled CSS property '${rawProp}'.`,
              suggestion: suggestedProp
                ? `Did you mean '${suggestedProp}'?`
                : `Check for spelling mistakes or verify that '${rawProp}' is a valid CSS specification property.`,
              quickFix: suggestedProp
                ? {
                    label: `Replace with '${suggestedProp}'`,
                    apply: (fullCss) => {
                      const arr = fullCss.split('\n');
                      arr[lineIdx] = arr[lineIdx].replace(new RegExp(`\\b${rawProp}\\b`), suggestedProp);
                      return arr.join('\n');
                    }
                  }
                : undefined
            });
          }
        }

        // Quality rule: Rigid '100vh' viewport jump
        if (rawVal.includes('100vh')) {
          issues.push({
            id: `quality-dvh-${lineNumber}`,
            line: lineNumber,
            column: line.indexOf('100vh') + 1,
            severity: 'suggestion',
            category: 'responsive',
            rule: 'prefer-dynamic-viewport-unit',
            message: '`100vh` causes sudden layout jumping on mobile devices when browser address bars collapse.',
            suggestion: 'Use modern dynamic viewport height `100dvh` (Dynamic Viewport Height) for smooth mobile layouts.',
            quickFix: {
              label: 'Upgrade to 100dvh',
              apply: (fullCss) => {
                const arr = fullCss.split('\n');
                arr[lineIdx] = arr[lineIdx].replace('100vh', '100dvh');
                return arr.join('\n');
              }
            }
          });
        }

        // Quality rule: Fixed large pixel width causing overflow
        const fixedWidthMatch = rawVal.match(/\b([5-9]\d{2,}|[1-9]\d{3,})px\b/);
        if ((rawProp === 'width' || rawProp === 'min-width') && fixedWidthMatch) {
          const pxVal = fixedWidthMatch[1];
          issues.push({
            id: `quality-fixed-overflow-${lineNumber}`,
            line: lineNumber,
            column: line.indexOf(fixedWidthMatch[0]) + 1,
            severity: 'warning',
            category: 'responsive',
            rule: 'no-rigid-pixel-width',
            message: `Fixed '${rawProp}: ${fixedWidthMatch[0]}' exceeds mobile screen bounds (< 390px) and will trigger horizontal scrollbars.`,
            suggestion: `Wrap with fluid clamping or container max-width: 'width: min(100%, ${pxVal}px)' or 'max-width: 100%'.`,
            quickFix: {
              label: `Make responsive: min(100%, ${pxVal}px)`,
              apply: (fullCss) => {
                const arr = fullCss.split('\n');
                arr[lineIdx] = arr[lineIdx].replace(
                  new RegExp(`${rawProp}\\s*:\\s*${pxVal}px`),
                  `${rawProp}: min(100%, ${pxVal}px)`
                );
                return arr.join('\n');
              }
            }
          });
        }

        // Quality rule: Animating layout-thrashing properties (width, height, margin, top)
        if (rawProp === 'transition' || rawProp === 'transition-property') {
          const slowProps = ['width', 'height', 'margin', 'padding', 'top', 'left', 'right', 'bottom'];
          const matchedSlow = slowProps.filter((p) => new RegExp(`\\b${p}\\b`).test(rawVal));
          if (matchedSlow.length > 0) {
            issues.push({
              id: `perf-layout-thrashing-${lineNumber}`,
              line: lineNumber,
              column: line.indexOf(matchedSlow[0]) + 1,
              severity: 'warning',
              category: 'performance',
              rule: 'prefer-gpu-composited-transforms',
              message: `Transitioning layout geometry property '${matchedSlow.join(', ')}' triggers CPU reflow and drops frame rates below 60fps.`,
              suggestion: "Animate GPU-composited properties `transform` (e.g. translate, scale) and `opacity` instead.",
              quickFix: {
                label: 'Replace with transform & opacity',
                apply: (fullCss) => {
                  const arr = fullCss.split('\n');
                  arr[lineIdx] = arr[lineIdx].replace(/width|height|margin|top|left/g, 'transform, opacity');
                  return arr.join('\n');
                }
              }
            });
          }
        }

        // Quality rule: Inaccessible focus removal
        if (rawProp === 'outline' && (rawVal === 'none' || rawVal === '0' || rawVal === '0px')) {
          issues.push({
            id: `a11y-outline-none-${lineNumber}`,
            line: lineNumber,
            column: line.indexOf(rawVal) + 1,
            severity: 'error',
            category: 'a11y',
            rule: 'no-outline-none-without-focus',
            message: 'Removing focus outline with `outline: none` breaks keyboard accessibility for screen reader and keyboard users.',
            suggestion: 'Provide a visible focus indicator using `:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }`.',
            quickFix: {
              label: 'Replace with accessible focus ring',
              apply: (fullCss) => {
                const arr = fullCss.split('\n');
                arr[lineIdx] = arr[lineIdx].replace(/outline\s*:\s*(none|0|0px);?/, 'outline: 2px solid #3b82f6; outline-offset: 2px;');
                return arr.join('\n');
              }
            }
          });
        }

        // Quality rule: !important overuse
        if (rawVal.includes('!important')) {
          issues.push({
            id: `quality-important-${lineNumber}`,
            line: lineNumber,
            column: line.indexOf('!important') + 1,
            severity: 'suggestion',
            category: 'modern-css',
            rule: 'no-important-overuse',
            message: '`!important` overrides the CSS cascade and creates maintainability debt.',
            suggestion: 'Organize selectors using CSS Cascade Layers (`@layer`) or increase selector specificity naturally.',
            quickFix: {
              label: 'Remove `!important`',
              apply: (fullCss) => {
                const arr = fullCss.split('\n');
                arr[lineIdx] = arr[lineIdx].replace(/\s*!important/g, '');
                return arr.join('\n');
              }
            }
          });
        }

        // Quality rule: Obsolete vendor prefixes (e.g. -webkit-border-radius, -moz-box-shadow)
        if (rawProp.startsWith('-webkit-border-radius') || rawProp.startsWith('-moz-border-radius') || rawProp.startsWith('-moz-box-shadow')) {
          const standardProp = rawProp.replace(/^-(webkit|moz)-/, '');
          issues.push({
            id: `quality-obsolete-prefix-${lineNumber}`,
            line: lineNumber,
            column: line.indexOf(rawProp) + 1,
            severity: 'suggestion',
            category: 'modern-css',
            rule: 'no-obsolete-vendor-prefixes',
            message: `Prefix '${rawProp}' is obsolete; all modern engines support standard '${standardProp}'.`,
            suggestion: `Replace with standard property '${standardProp}'.`,
            quickFix: {
              label: `Replace with '${standardProp}'`,
              apply: (fullCss) => {
                const arr = fullCss.split('\n');
                arr[lineIdx] = arr[lineIdx].replace(rawProp, standardProp);
                return arr.join('\n');
              }
            }
          });
        }

        // Quality rule: Logical properties recommendation (margin-left/right -> margin-inline)
        if (rawProp === 'margin-left' || rawProp === 'margin-right') {
          issues.push({
            id: `quality-logical-prop-${lineNumber}`,
            line: lineNumber,
            column: line.indexOf(rawProp) + 1,
            severity: 'suggestion',
            category: 'modern-css',
            rule: 'prefer-logical-properties',
            message: `Physical property '${rawProp}' does not automatically adapt to right-to-left (RTL) reading modes.`,
            suggestion: "Consider using modern CSS logical properties like `margin-inline-start` or `margin-inline`.",
            quickFix: {
              label: 'Convert to margin-inline',
              apply: (fullCss) => {
                const arr = fullCss.split('\n');
                arr[lineIdx] = arr[lineIdx].replace(/margin-(left|right)/, 'margin-inline');
                return arr.join('\n');
              }
            }
          });
        }

        // Quality rule: Missing unit on non-zero numbers
        const unitlessMatch = rawVal.match(/^([1-9]\d*)\s*$/);
        if (unitlessMatch && (rawProp === 'width' || rawProp === 'height' || rawProp === 'padding' || rawProp === 'margin' || rawProp === 'font-size')) {
          issues.push({
            id: `syntax-unitless-length-${lineNumber}`,
            line: lineNumber,
            column: line.indexOf(unitlessMatch[1]) + 1,
            severity: 'error',
            category: 'syntax',
            rule: 'length-zero-no-unit',
            message: `Non-zero dimension '${rawVal}' is missing a unit (e.g., px, rem, %).`,
            suggestion: `Append appropriate unit: '${rawVal}px' or '${rawVal}rem'.`,
            quickFix: {
              label: `Add 'px' unit (${unitlessMatch[1]}px)`,
              apply: (fullCss) => {
                const arr = fullCss.split('\n');
                arr[lineIdx] = arr[lineIdx].replace(new RegExp(`:\\s*${unitlessMatch[1]};?`), `: ${unitlessMatch[1]}px;`);
                return arr.join('\n');
              }
            }
          });
        }
      }
    }
  }

  // Check for any unclosed braces left over at end of file
  if (unclosedBraceStack.length > 0) {
    unclosedBraceStack.forEach((unclosed, idx) => {
      issues.push({
        id: `syntax-unclosed-brace-${unclosed.line}-${idx}`,
        line: unclosed.line,
        column: unclosed.column,
        severity: 'error',
        category: 'syntax',
        rule: 'no-unclosed-blocks',
        message: `Unclosed rule block starting at line ${unclosed.line}. Missing closing brace '}'.`,
        suggestion: "Add a closing brace `}` at the end of the selector block.",
        quickFix: {
          label: 'Append closing `}` to file',
          apply: (fullCss) => {
            return fullCss.trimEnd() + '\n}';
          }
        }
      });
    });
  }

  // Calculate counts and code health score
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length;

  // Health score calculation (out of 100)
  // Each error deducts 15pts, each warning 8pts, each suggestion 3pts
  let penalty = errorCount * 15 + warningCount * 8 + suggestionCount * 3;
  const healthScore = Math.max(0, Math.min(100, 100 - penalty));

  return {
    issues,
    errorCount,
    warningCount,
    suggestionCount,
    healthScore,
  };
}
