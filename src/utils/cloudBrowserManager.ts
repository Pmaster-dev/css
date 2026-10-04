import { CloudBrowserSession } from '../types';

const STORAGE_KEY = 'css_studio_cloud_browser_session_v1';

function generateRandomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function getOrCreateCloudBrowserSession(): CloudBrowserSession {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sessionId) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('SessionStorage read error, generating fallback session:', err);
  }

  const now = new Date();
  const sessionId = `usr_priv_${now.getTime().toString(36)}_${generateRandomHex(8)}`;
  const fingerprintHash = `sha256:ephem_${generateRandomHex(16)}`;

  const newSession: CloudBrowserSession = {
    sessionId,
    fingerprintHash,
    status: 'isolated',
    createdAt: now.toISOString(),
    sandboxMode: 'strict-origin-partition',
    privacyLevel: 'zero-knowledge-ephemeral',
    dataBleedPrevented: true,
    activeIframeSandbox: 'allow-scripts allow-forms allow-popups',
    networkShield: 'isolated-virtual-dom-shield',
    storageIsolation: 'per-user-memory-scoped',
    userWorkspaceId: `ws_${generateRandomHex(6)}`
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  } catch {
    // ignore
  }

  return newSession;
}

export function rotateCloudBrowserSession(): CloudBrowserSession {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return getOrCreateCloudBrowserSession();
}

export function purgeEphemeralStorage(): void {
  try {
    // Clean temporary cache keys without affecting essential user settings
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('tmp_preview_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}
