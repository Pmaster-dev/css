/**
 * Resilient File Download Utility
 * 
 * Solves:
 * 1. iFrame Sandbox restrictions (AI Studio preview iframe blocking <a download>)
 * 2. Mobile WebView limitations (Android/iOS WebView missing native DownloadListener)
 * 3. Blob URL race conditions (premature URL.revokeObjectURL breaking download stream)
 * 4. Fallback to Data URI, Server Attachment, and Clipboard
 */

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
  mimeType = 'text/css;charset=utf-8',
  onFallbackCopied,
}: DownloadFileOptions): DownloadResult {
  if (typeof window === 'undefined') {
    return { success: false, method: 'blob', message: 'Window is undefined' };
  }

  // Attempt 1: Standard Blob Anchor Download with Delayed Revocation
  try {
    const blob = new Blob([content], { type: mimeType });
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
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch {
        // cleanup ignore
      }
    }, 60000);

    return {
      success: true,
      method: 'blob',
      message: `Downloading ${filename}...`,
    };
  } catch (blobErr) {
    console.warn('[DownloadHelper] Blob download failed, attempting data URI fallback:', blobErr);
  }

  // Attempt 2: Data URI Fallback
  try {
    const dataUri = `data:${mimeType},${encodeURIComponent(content)}`;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {
        // ignore
      }
    }, 10000);

    return {
      success: true,
      method: 'data-uri',
      message: `Downloaded via Data URI: ${filename}`,
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
        message: 'Download blocked by browser sandbox. Code was copied to clipboard instead!',
      };
    }
  } catch (clipErr) {
    console.error('[DownloadHelper] Clipboard fallback failed:', clipErr);
  }

  return {
    success: false,
    method: 'blob',
    message: 'Unable to initiate file download in this restricted environment. Please copy the code directly.',
  };
}

/**
 * Server-driven download helper via HTTP POST form/fetch
 * Uses Content-Disposition: attachment for maximum WebView/iFrame compatibility
 */
export async function downloadViaServer(filename: string, content: string, mimeType = 'text/css'): Promise<boolean> {
  try {
    const response = await fetch('/api/download/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, content, mimeType }),
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
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 60000);

    return true;
  } catch (err) {
    console.warn('[DownloadHelper] Server download failed, falling back to local:', err);
    const res = downloadFile({ content, filename, mimeType });
    return res.success;
  }
}
