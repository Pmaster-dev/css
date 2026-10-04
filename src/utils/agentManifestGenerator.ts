/**
 * Agent Manifest & Discovery Generator
 * Formats inline documentation ready for:
 * 1. .agents (AI Agent Capabilities & Tool Calling Manifest)
 * 2. [file provider] (Virtual File System & Stream Attachment Specification)
 * 3. [api edge functions and discovery in /etc] (/etc/ai-agent-manifest.json & Edge Endpoints)
 */

import { MIME_PAIR_ADJUSTMENTS } from './downloadHelper';

export interface AgentDiscoverySpec {
  schemaVersion: string;
  provider: string;
  workbench: string;
  discoveryPath: string;
  edgeFunctions: {
    endpoint: string;
    method: 'GET' | 'POST' | 'OPTIONS';
    contentType: string;
    description: string;
    parameters?: Record<string, string>;
  }[];
  fileProvider: {
    protocol: string;
    mountPoint: string;
    supportedMimePairs: typeof MIME_PAIR_ADJUSTMENTS;
    capabilities: string[];
  };
  etcConfiguration: {
    path: string;
    symlink: string;
    environmentVariables: Record<string, string>;
  };
}

export const AGENT_DISCOVERY_DATA: AgentDiscoverySpec = {
  schemaVersion: '2026.10-v1',
  provider: 'Advanced CSS Studio Edge Engine',
  workbench: 'Adaptive CSS Workbench & Layout Engineering Suite',
  discoveryPath: '/etc/ai-agent-manifest.json',
  edgeFunctions: [
    {
      endpoint: '/api/download/file',
      method: 'POST',
      contentType: 'application/json -> multipart/octet-stream',
      description: 'Stream resilient HTTP file attachments with Content-Disposition headers for WebView & iFrame bypass.',
      parameters: {
        filename: 'string (e.g., styles.min.css, manifest.txt)',
        content: 'string (CSS, JSON, or Plaintext body)',
        mimeType: 'string (e.g., text/css; charset=utf-8)',
      },
    },
    {
      endpoint: '/api/preferences/desktop-delivery.txt',
      method: 'GET',
      contentType: 'text/plain; charset=utf-8',
      description: 'CORS-enabled desktop delivery endpoint for DeafAuth & PinkSync INI/plaintext preferences.',
    },
    {
      endpoint: '/api/preferences/sync',
      method: 'POST',
      contentType: 'application/json',
      description: 'Two-way state synchronization hook for desktop clients, CLI tools, and browser extensions.',
    },
    {
      endpoint: '/api/scan-legacy-css',
      method: 'POST',
      contentType: 'application/json',
      description: 'Deep Chromium engine scanner with Blink compatibility baseline analysis and Google Search citations.',
    },
    {
      endpoint: '/api/agents/discovery',
      method: 'GET',
      contentType: 'application/json',
      description: 'Live machine-parseable discovery endpoint for AI Agents and automated file orchestrators.',
    },
  ],
  fileProvider: {
    protocol: 'css-studio-vfs://',
    mountPoint: '/studio-workspace',
    supportedMimePairs: MIME_PAIR_ADJUSTMENTS,
    capabilities: [
      'atomic-write',
      'delayed-blob-revocation (60s)',
      'data-uri-fallback',
      'content-disposition-streaming',
      'clipboard-buffer-fallback',
      'wcag-aa-validation',
      'regex-minification-pass',
    ],
  },
  etcConfiguration: {
    path: '/etc/ai-agent-manifest.json',
    symlink: '/etc/css-studio/agent.conf',
    environmentVariables: {
      CSS_STUDIO_AGENT_DISCOVERY: '/etc/ai-agent-manifest.json',
      CSS_STUDIO_FILE_PROVIDER: 'css-studio-vfs://',
      CSS_STUDIO_EDGE_TIMEOUT_MS: '60000',
    },
  },
};

/**
 * Builds the Markdown representation ready for .agents
 */
export function generateAgentManifestMarkdown(host = 'http://localhost:3000'): string {
  const timestamp = new Date().toISOString();
  return `# .agents Specification & Discovery Manifest
<!-- Generated: ${timestamp} | Advanced CSS Studio Core Engine -->

## 1. Overview & Identity
- **Provider**: ${AGENT_DISCOVERY_DATA.provider}
- **Workbench**: ${AGENT_DISCOVERY_DATA.workbench}
- **Schema Version**: ${AGENT_DISCOVERY_DATA.schemaVersion}
- **Host Base**: \`${host}\`
- **System Discovery Path**: \`${AGENT_DISCOVERY_DATA.discoveryPath}\`

---

## 2. [file provider] Specification
The virtual file provider delivers structured stylesheets, minified assets, and preference manifests across sandboxed runtimes.

- **Protocol**: \`${AGENT_DISCOVERY_DATA.fileProvider.protocol}\`
- **Mount Point**: \`${AGENT_DISCOVERY_DATA.fileProvider.mountPoint}\`
- **Resilient Engine Features**:
  - **Delayed URL Revocation**: Blob URLs are preserved for 60,000ms to eliminate Chromium WebView race conditions.
  - **Data URI Fallback**: Synthetic anchor execution fallback when Blob creation is restricted.
  - **Server-Side Attachment Route**: Direct \`Content-Disposition: attachment\` HTTP transmission.
  - **Clipboard Buffer Interceptor**: Automatic fallback to \`navigator.clipboard.writeText\` if disk writing is blocked.

### Registered MIME Pair Adjustments
| Key | Extension | MIME Type | Charset | Disposition | Description |
|:---|:---|:---|:---|:---|:---|
${Object.entries(MIME_PAIR_ADJUSTMENTS)
  .map(
    ([k, v]) =>
      `| \`${k}\` | \`${v.extension}\` | \`${v.mimeType}\` | \`${v.charset}\` | \`${v.disposition}\` | ${v.description} |`
  )
  .join('\n')}

---

## 3. [api edge function and discovery in /etc]
Edge functions handle real-time streaming, CORS delivery, and engine synchronization.

### System Configuration in \`/etc\`
\`\`\`json
{
  "agent_config_path": "/etc/ai-agent-manifest.json",
  "symlink_target": "/etc/css-studio/agent.conf",
  "discovery_url": "${host}/api/agents/discovery",
  "file_provider_url": "${host}/api/download/file",
  "environment_variables": {
    "CSS_STUDIO_AGENT_DISCOVERY": "/etc/ai-agent-manifest.json",
    "CSS_STUDIO_FILE_PROVIDER": "css-studio-vfs://",
    "CSS_STUDIO_EDGE_TIMEOUT_MS": "60000"
  }
}
\`\`\`

### Edge API Endpoints
${AGENT_DISCOVERY_DATA.edgeFunctions
  .map(
    (fn) => `### \`${fn.method} ${fn.endpoint}\`
- **Content-Type**: \`${fn.contentType}\`
- **Purpose**: ${fn.description}
${
  fn.parameters
    ? `- **Parameters**:
\`\`\`json
${JSON.stringify(fn.parameters, null, 2)}
\`\`\``
    : ''
}
`
  )
  .join('\n')}

---

## 4. CSS Linter & Performance Rules Engine
- **@import Policy**: Flagged with **DO NOT**, **WARN**, and **TIP** notes to eliminate render-blocking HTTP waterfalls.
- **Viewport Dynamic**: \`100dvh\` enforcement over jumpy \`100vh\`.
- **GPU Composited**: Transitions limited to \`transform\` & \`opacity\`.
- **Zero-Unit Optimization**: Elimination of superfluous dimension units on zero values.
`;
}

/**
 * Builds the machine-parseable JSON representation ready for /etc/ai-agent-manifest.json
 */
export function generateAgentManifestJson(host = 'http://localhost:3000'): string {
  return JSON.stringify(
    {
      ...AGENT_DISCOVERY_DATA,
      host,
      generatedAt: new Date().toISOString(),
    },
    null,
    2
  );
}
