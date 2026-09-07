/**
 * DOM Sanitizer & setHTML() Engine
 * Implements the W3C / WHATWG HTML Sanitizer API pattern.
 * Safely parses HTML strings into the DOM while neutralizing XSS traps.
 */

export interface SanitizerReport {
  rawLength: number;
  cleanLength: number;
  droppedTags: string[];
  droppedAttributes: string[];
  isSafe: boolean;
  cleanHtml: string;
}

const ALLOWED_ELEMENTS = new Set([
  'a', 'article', 'aside', 'b', 'blockquote', 'button', 'caption', 'cite', 'code',
  'div', 'em', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hr', 'i', 'img', 'kbd', 'li', 'main', 'mark', 'nav', 'ol', 'p',
  'pre', 'section', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody',
  'td', 'tfoot', 'th', 'thead', 'time', 'tr', 'ul', 'video', 'audio', 'source', 'track'
]);

const ALLOWED_ATTRIBUTES = new Set([
  'class', 'id', 'role', 'aria-label', 'aria-hidden', 'aria-describedby',
  'aria-live', 'href', 'src', 'alt', 'title', 'width', 'height', 'data-security',
  'controls', 'playsinline', 'srclang', 'label', 'kind', 'default', 'type', 'target'
]);

const FORBIDDEN_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'];

/**
 * Parses and sanitizes an HTML string using DOMParser and Sanitizer specifications.
 */
export function sanitizeHtmlWithSetHtml(inputHtml: string): SanitizerReport {
  const droppedTags: string[] = [];
  const droppedAttributes: string[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(inputHtml, 'text/html');

    // Recursively sanitize all nodes in body
    const sanitizeNode = (node: Node) => {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          const tagName = el.tagName.toLowerCase();

          // Check if tag is allowed
          if (!ALLOWED_ELEMENTS.has(tagName)) {
            droppedTags.push(`<${tagName}>`);
            // Replace dangerous element with its text content or remove if script/style/iframe
            if (tagName === 'script' || tagName === 'iframe' || tagName === 'object' || tagName === 'embed') {
              el.remove();
              continue;
            } else {
              // Convert to span wrapper
              const span = document.createElement('span');
              span.textContent = el.textContent;
              el.replaceWith(span);
              continue;
            }
          }

          // Check attributes
          const attrs = Array.from(el.attributes);
          for (const attr of attrs) {
            const attrName = attr.name.toLowerCase();
            const attrVal = attr.value.toLowerCase().trim();

            // Drop inline event handlers (onclick, onerror, etc.)
            if (attrName.startsWith('on')) {
              droppedAttributes.push(`${attrName}="${attr.value}"`);
              el.removeAttribute(attr.name);
              continue;
            }

            // Check if attribute is allowed
            if (!ALLOWED_ATTRIBUTES.has(attrName) && !attrName.startsWith('data-') && !attrName.startsWith('aria-')) {
              droppedAttributes.push(`${attrName}="${attr.value}"`);
              el.removeAttribute(attr.name);
              continue;
            }

            // Check for javascript: or data: in href/src
            if (attrName === 'href' || attrName === 'src') {
              for (const protocol of FORBIDDEN_PROTOCOLS) {
                if (attrVal.startsWith(protocol)) {
                  droppedAttributes.push(`${attrName}="${protocol}..."`);
                  el.removeAttribute(attr.name);
                  break;
                }
              }
            }
          }

          // Sanitize nested children
          sanitizeNode(el);
        }
      }
    };

    sanitizeNode(doc.body);

    const cleanHtml = doc.body.innerHTML;

    return {
      rawLength: inputHtml.length,
      cleanLength: cleanHtml.length,
      droppedTags: Array.from(new Set(droppedTags)),
      droppedAttributes: Array.from(new Set(droppedAttributes)),
      isSafe: droppedTags.length === 0 && droppedAttributes.length === 0,
      cleanHtml,
    };
  } catch (err) {
    return {
      rawLength: inputHtml.length,
      cleanLength: 0,
      droppedTags: ['<parse-error>'],
      droppedAttributes: [],
      isSafe: false,
      cleanHtml: '<div>Failed to parse HTML securely.</div>',
    };
  }
}
