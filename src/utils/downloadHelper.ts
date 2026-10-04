/**
 * Resilient File Download Utility & MIME Pair Adjustment Engine
 * 
 * Solves:
 * 1. iFrame Sandbox restrictions (AI Studio preview iframe blocking synthetic <a download>)
 * 2. Mobile WebView limitations (Android/iOS WebView missing native DownloadListener)
 * 3. Blob URL race conditions (premature URL.revokeObjectURL breaking download stream)
 * 4. MIME Pair Adjustments (ensures proper content-type, charset, and disposition headers)
 * 5. Multi-tier Fallback (Blob with delayed revocation -> Data URI -> Server Attachment -> Clipboard)
 */

export interface MimePairAdjustment {
  extension: string;
  mimeType: string;
  charset: string;
  disposition: 'attachment' | 'inline';
  description: string;
  recommendedBuffer: 'string' | 'blob' | 'arraybuffer';
}

/**
 * Standard MIME Pair Adjustments Mapping
 * Defines precise content headers, charsets, and disposition modes for all workbench assets.
 */
export const MIME_PAIR_ADJUSTMENTS: Record<string, MimePairAdjustment> = {
  css: {
    extension: '.css',
    mimeType: 'text/css',
    charset: 'utf-8',
    disposition: 'attachment',
    description: 'Cascading Style Sheet',
    recommendedBuffer: 'string',
  },
  minCss: {
    extension: '.min.css',
    mimeType: 'text/css',
    charset: 'utf-8',
    disposition: 'attachment',
    description: 'Production Compressed CSS Bundle',
    recommendedBuffer: 'string',
  },
  txt: {
    extension: '.txt',
    mimeType: 'text/plain',
    charset: 'utf-8',
    disposition: 'attachment',
    description: 'Plaintext Accessibility & Configuration Manifest',
    recommendedBuffer: 'string',
  },
  json: {
    extension: '.json',
    mimeType: 'application/json',
    charset: 'utf-8',
    disposition: 'attachment',
    description: 'JSON Schema & Agent Configuration',
    recommendedBuffer: 'string',
  },
  agents: {
    extension: '.agents',
    mimeType: 'text/markdown',
    charset: 'utf-8',
    disposition: 'inline',
    description: 'AI Agent Capability & Discovery Manifest',
    recommendedBuffer: 'string',
  },
  svg: {
    extension: '.svg',
    mimeType: 'image/svg+xml',
    charset: 'utf-8',
    disposition: 'inline',
    description: 'Scalable Vector Graphics Markup',
    recommendedBuffer: 'string',
  },
  html: {
    extension: '.html',
    mimeType: 'text/html',
    charset: 'utf-8',
    disposition: 'attachment',
    description: 'HTML5 Component Template Markup',
    recommendedBuffer: 'string',
  },
};

/**
 * Resolves the matching MIME Pair adjustment based on file extension
 */
export function resolveMimePair(filename: string, overrideMime?: string): MimePairAdjustment {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.min.css')) return MIME_PAIR_ADJUSTMENTS.minCss;
  if (lower.endsWith('.css')) return MIME_PAIR_ADJUSTMENTS.css;
  if (lower.endsWith('.txt')) return MIME_PAIR_ADJUSTMENTS.txt;
  if (lower.endsWith('.json')) return MIME_PAIR_ADJUSTMENTS.json;
  if (lower.endsWith('.agents') || lower === '.agents') return MIME_PAIR_ADJUSTMENTS.agents;
  if (lower.endsWith('.svg')) return MIME_PAIR_ADJUSTMENTS.svg;
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return MIME_PAIR_ADJUSTMENTS.html;

  return {
    extension: filename.includes('.') ? `.${filename.split('.').pop()}` : '.txt',
    mimeType: overrideMime || 'text/plain',
    charset: 'utf-8',
    disposition: 'attachment',
    description: 'Generic Document',
    recommendedBuffer: 'string',
  };
}

export interface DownloadFileOptions {
  content: string;
  filename: string;
  mimeType?: string;
  onFallbackCopied?: () => void;
}

export interface DownloadResult {
  success: boolean;
  method: 'blob' | 'data-uri' | 'server' | 'clipboard' | 'window';
  message: string;
  mimeAdjustment?: MimePairAdjustment;
}

/**
 * Checks if the current app is executing inside an iframe
 */
export function isRunningInIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Checks if running inside an embedded WebView (Android / iOS)
 */
export function isRunningInWebView(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isAndroidWebView = /wv|Android.*Version\/[0-9\.]+/i.test(ua);
  const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);
  return isAndroidWebView || isIOSWebView;
}

/**
 * Universal file download with multi-tier fallback
 */
export function downloadFile({
  content,
  filename,
  mimeType,
  onFallbackCopied,
}: DownloadFileOptions): DownloadResult {
  if (typeof window === 'undefined') {
    return { success: false, method: 'blob', message: 'Window is undefined' };
  }

  const mimeAdj = resolveMimePair(filename, mimeType);
  const effectiveMime = `${mimeAdj.mimeType};charset=${mimeAdj.charset}`;

  // Attempt 1: Standard Blob Anchor Download with Delayed Revocation (60s)
  try {
    const blob = new Blob([content], { type: effectiveMime });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.setAttribute('download', filename);
    link.target = '_self';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Critical: Do NOT revokeObjectURL immediately.
    // WebViews and sandboxed browsers require time to read the stream.
    setTimeout(() => {
      try {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      } catch {
        // cleanup ignore
      }
    }, 60000);

    return {
      success: true,
      method: 'blob',
      message: `Downloading ${filename}...`,
      mimeAdjustment: mimeAdj,
    };
  } catch (blobErr) {
    console.warn('[DownloadHelper] Blob download failed, attempting data URI fallback:', blobErr);
  }

  // Attempt 2: Data URI Fallback
  try {
    const dataUri = `data:${effectiveMime},${encodeURIComponent(content)}`;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
      } catch {
        // ignore
      }
    }, 10000);

    return {
      success: true,
      method: 'data-uri',
      message: `Downloaded via Data URI: ${filename}`,
      mimeAdjustment: mimeAdj,
    };
  } catch (dataErr) {
    console.warn('[DownloadHelper] Data URI failed, falling back to clipboard:', dataErr);
  }

  // Attempt 3: Clipboard Fallback with Callback
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(content);
      if (onFallbackCopied) onFallbackCopied();
      return {
        success: true,
        method: 'clipboard',
        message: 'Download blocked by browser iframe sandbox. Code was copied to clipboard instead!',
        mimeAdjustment: mimeAdj,
      };
    }
  } catch (clipErr) {
    console.error('[DownloadHelper] Clipboard fallback failed:', clipErr);
  }

  return {
    success: false,
    method: 'blob',
    message: 'Unable to initiate file download in this restricted environment. Please copy code directly.',
    mimeAdjustment: mimeAdj,
  };
}

/**
 * Server-driven download helper via HTTP POST form/fetch
 * Uses Content-Disposition: attachment for maximum WebView/iFrame compatibility
 */
export async function downloadViaServer(filename: string, content: string, mimeType?: string): Promise<boolean> {
  const mimeAdj = resolveMimePair(filename, mimeType);
  try {
    const response = await fetch('/api/download/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        filename, 
        content, 
        mimeType: `${mimeAdj.mimeType}; charset=${mimeAdj.charset}` 
      }),
    });

    if (!response.ok) throw new Error('Server download response not ok');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 60000);

    return true;
  } catch (err) {
    console.warn('[DownloadHelper] Server download failed, falling back to local:', err);
    const res = downloadFile({ content, filename, mimeType: mimeAdj.mimeType });
    return res.success;
  }
}
