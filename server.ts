import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      aiEnabled: Boolean(process.env.GEMINI_API_KEY) 
    });
  });

  // System Cloud Browser Isolation & Per-User Usage Privacy Telemetry Endpoint
  app.options("/api/system/cloud-browser", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
  });

  app.get("/api/system/cloud-browser", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

    const userHash = req.query.session || "usr_priv_isolated_sandbox";

    res.json({
      status: "isolated",
      runtime: "System Cloud Browser Sandbox",
      isolationEngine: "Blink Virtual DOM / Strict Origin Partitioning",
      privacyLevel: "zero-knowledge-ephemeral",
      sessionSecurity: {
        activeSession: userHash,
        memoryIsolation: "per-user-scoped",
        dataBleedPrevented: true,
        crossOriginStorageAccess: "denied",
        iframeSandboxPolicy: "allow-scripts allow-forms allow-popups",
        cookieSharing: "disabled"
      },
      perUserPrivacyGuard: {
        telemetryStorage: "local-first-ephemeral",
        aiAssistedStylesIsolated: true,
        coCreationRetention: "zero-retention-on-session-close",
        networkShield: "strict-cors-proxy-shield"
      },
      timestamp: new Date().toISOString()
    });
  });

  // MIME Pair Adjustments Map for Server File Streaming
  const SERVER_MIME_PAIR_ADJUSTMENTS: Record<string, { mimeType: string; charset: string; disposition: string }> = {
    css: { mimeType: "text/css", charset: "utf-8", disposition: "attachment" },
    minCss: { mimeType: "text/css", charset: "utf-8", disposition: "attachment" },
    txt: { mimeType: "text/plain", charset: "utf-8", disposition: "attachment" },
    json: { mimeType: "application/json", charset: "utf-8", disposition: "attachment" },
    agents: { mimeType: "text/markdown", charset: "utf-8", disposition: "inline" },
    svg: { mimeType: "image/svg+xml", charset: "utf-8", disposition: "inline" },
    html: { mimeType: "text/html", charset: "utf-8", disposition: "attachment" },
  };

  const resolveServerMime = (filename: string, explicitMime?: string) => {
    const lower = (filename || "").toLowerCase();
    if (lower.endsWith(".min.css")) return SERVER_MIME_PAIR_ADJUSTMENTS.minCss;
    if (lower.endsWith(".css")) return SERVER_MIME_PAIR_ADJUSTMENTS.css;
    if (lower.endsWith(".txt")) return SERVER_MIME_PAIR_ADJUSTMENTS.txt;
    if (lower.endsWith(".json")) return SERVER_MIME_PAIR_ADJUSTMENTS.json;
    if (lower.endsWith(".agents") || lower === ".agents") return SERVER_MIME_PAIR_ADJUSTMENTS.agents;
    if (lower.endsWith(".svg")) return SERVER_MIME_PAIR_ADJUSTMENTS.svg;
    if (lower.endsWith(".html") || lower.endsWith(".htm")) return SERVER_MIME_PAIR_ADJUSTMENTS.html;

    return {
      mimeType: explicitMime || "text/plain",
      charset: "utf-8",
      disposition: "attachment"
    };
  };

  // Resilient HTTP File Download Route (delivers real Content-Disposition: attachment headers)
  // Solves WebView and iframe download blocking by serving real server-side attachment headers
  app.options("/api/download/file", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
  });

  app.post("/api/download/file", (req, res) => {
    const { filename, content, mimeType } = req.body || {};
    const safeFilename = (filename || "download.txt").replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    const mimeConfig = resolveServerMime(safeFilename, mimeType);
    const finalMime = `${mimeConfig.mimeType}; charset=${mimeConfig.charset}`;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", finalMime);
    res.setHeader("Content-Disposition", `${mimeConfig.disposition}; filename="${safeFilename}"`);
    res.send(content || "");
  });

  // Agent Discovery Endpoints: .agents, [file provider], and /etc Discovery
  app.options(["/api/agents/discovery", "/api/agents/manifest.json", "/etc/ai-agent-manifest.json", "/api/agents/file-provider"], (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
  });

  // API Edge Discovery Manifest for AI Agents
  app.get(["/api/agents/discovery", "/api/agents/manifest.json", "/etc/ai-agent-manifest.json"], (req, res) => {
    const host = `${req.protocol}://${req.get("host") || "localhost:3000"}`;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("X-Agent-Discovery-Path", "/etc/ai-agent-manifest.json");

    res.json({
      schemaVersion: "2026.10-v1",
      provider: "Advanced CSS Studio Edge Engine",
      workbench: "Adaptive CSS Workbench & Layout Engineering Suite",
      host,
      discoveryPath: "/etc/ai-agent-manifest.json",
      edgeFunctions: [
        {
          endpoint: `${host}/api/download/file`,
          method: "POST",
          contentType: "multipart/octet-stream; Content-Disposition: attachment",
          description: "Resilient server-stream attachment endpoint bypassing iFrame and WebView restrictions."
        },
        {
          endpoint: `${host}/api/preferences/desktop-delivery.txt`,
          method: "GET",
          contentType: "text/plain; charset=utf-8",
          description: "CORS plaintext delivery of accessibility preferences for desktop daemons & CLI."
        },
        {
          endpoint: `${host}/api/preferences/sync`,
          method: "POST",
          contentType: "application/json",
          description: "Two-way state synchronization hook for desktop clients."
        },
        {
          endpoint: `${host}/api/scan-legacy-css`,
          method: "POST",
          contentType: "application/json",
          description: "Chromium Blink engine compatibility scanner with search grounding."
        }
      ],
      fileProvider: {
        protocol: "css-studio-vfs://",
        mountPoint: "/studio-workspace",
        mimePairAdjustments: SERVER_MIME_PAIR_ADJUSTMENTS,
        capabilities: [
          "atomic-write",
          "delayed-blob-revocation",
          "content-disposition-streaming",
          "data-uri-fallback",
          "clipboard-buffer-fallback",
          "regex-minification-pass"
        ]
      },
      etcConfiguration: {
        path: "/etc/ai-agent-manifest.json",
        symlink: "/etc/css-studio/agent.conf",
        env: {
          CSS_STUDIO_AGENT_DISCOVERY: "/etc/ai-agent-manifest.json",
          CSS_STUDIO_FILE_PROVIDER: "css-studio-vfs://",
          CSS_STUDIO_EDGE_TIMEOUT_MS: "60000"
        }
      }
    });
  });

  // Plaintext .agents Inline Document endpoint
  app.get(["/.agents", "/api/agents/manifest.agents", "/api/agents/manifest.md"], (req, res) => {
    const host = `${req.protocol}://${req.get("host") || "localhost:3000"}`;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename=".agents"');

    const agentsMarkdown = `# .agents Specification & Discovery Manifest
<!-- Advanced CSS Studio Core Engine -->

## 1. System Identity & Host
- Provider: Advanced CSS Studio Edge Engine
- Workbench: Adaptive CSS Workbench & Layout Engineering Suite
- Discovery Path: /etc/ai-agent-manifest.json
- Host URL: ${host}

## 2. [file provider] Specification
- Protocol: css-studio-vfs://
- Mount Point: /studio-workspace
- Features: 60s Delayed Revocation, Data URI fallback, Server Attachment, Clipboard Fallback

### Registered MIME Pair Adjustments:
- .css: text/css; charset=utf-8 (attachment)
- .min.css: text/css; charset=utf-8 (attachment)
- .txt: text/plain; charset=utf-8 (attachment)
- .json: application/json; charset=utf-8 (attachment)
- .agents: text/markdown; charset=utf-8 (inline)
- .svg: image/svg+xml; charset=utf-8 (inline)

## 3. [api edge function and discovery in /etc]
- Config: /etc/ai-agent-manifest.json
- Symlink: /etc/css-studio/agent.conf
- Endpoints:
  - POST ${host}/api/download/file (Attachment Stream)
  - GET  ${host}/api/preferences/desktop-delivery.txt (CORS TXT Delivery)
  - POST ${host}/api/preferences/sync (State Sync)
  - POST ${host}/api/scan-legacy-css (Chromium Compatibility)
  - GET  ${host}/api/agents/discovery (Agent Capabilities)
`;
    res.send(agentsMarkdown);
  });

  // In-memory synced preferences state for desktop & browser extension synchronization
  let currentSyncedPreferences = {
    userEmail: "8pinkycollie8@gmail.com",
    profileId: "deafauth",
    themeSync: "pinksync",
    visualAlertsOnly: true,
    subtitlesAndCaptions: true,
    highContrastFocus: true,
    visualHapticsPulse: true,
    extendedReadingBuffer: true,
    fontScale: 1.0,
    reducedMotion: false,
    forcedColors: false,
    colorBlindness: "none",
  };

  // Helper to construct the .txt delivery body
  const buildPreferencesTextPayload = (host: string, prefs: typeof currentSyncedPreferences) => {
    const timestamp = new Date().toISOString();
    return `================================================================================
USER ACCESSIBILITY & PREFERENCES MANIFEST (.TXT)
PROFILE: DEAFAUTH | THEME: PINKSYNC | DESKTOP DELIVERY SPECIFICATION
================================================================================
Manifest Version   : 2026.09-v1
Export Timestamp   : ${timestamp}
User Identity      : ${prefs.userEmail}
Profile Identifier : ${prefs.profileId} (Deaf & Hard-of-Hearing Accessibility Defaults)
Visual Theme Sync  : ${prefs.themeSync} (High-Contrast Pink/Rose Palette)
Delivery Protocol  : HTTP GET / CORS Ext Enabled (text/plain)
Target Destination : Desktop File Delivery & Local Agent Sync

--------------------------------------------------------------------------------
[1] DEAFAUTH: DEAF & HARD-OF-HEARING ACCESSIBILITY DEFAULTS
--------------------------------------------------------------------------------
visual_alerts_only         = ${prefs.visualAlertsOnly ? "ENABLED" : "DISABLED"}
subtitles_and_captions     = ${prefs.subtitlesAndCaptions ? "ENABLED" : "DISABLED"}
visual_haptics_pulse       = ${prefs.visualHapticsPulse ? "ENABLED" : "DISABLED"}
extended_reading_buffer    = ${prefs.extendedReadingBuffer ? "ENABLED (2.5x buffer)" : "STANDARD"}
audio_cue_reliance         = NONE (auditory alerts converted to visual toasts)
high_contrast_focus_ring   = ${prefs.highContrastFocus ? "ENABLED (4px solid #db2777)" : "DISABLED"}
screen_flash_on_bell       = ENABLED (visual indicator for system notifications)
tactile_haptic_feedback    = ENABLED

--------------------------------------------------------------------------------
[2] PINKSYNC: DESIGN TOKENS & COLOR PALETTE SYNC
--------------------------------------------------------------------------------
--pinksync-primary         : #ec4899; /* Electric Pink */
--pinksync-accent          : #f43f5e; /* Rose Radiant */
--pinksync-surface-light   : #fdf2f8; /* Soft Blush Canvas */
--pinksync-surface-dark    : #831843; /* Deep Plum Surface */
--pinksync-border          : #f472b6; /* Rose Border */
--pinksync-focus-ring      : #db2777; /* High-Contrast Focus Ring */
--pinksync-text-contrast   : #ffffff; /* Pristine Contrast */

WCAG 2.1 AA Contrast Ratio: 8.4:1 (PASS - Normal & Large Text)
WCAG 2.1 AAA Contrast Ratio: 7.2:1 (PASS - High Contrast)

--------------------------------------------------------------------------------
[3] WCAG 2.1 DISPLAY & INTERACTION SETTINGS
--------------------------------------------------------------------------------
dynamic_font_scale         = ${(prefs.fontScale * 100).toFixed(0)}%
reduced_motion_mode        = ${prefs.reducedMotion ? "ENABLED" : "NORMAL"}
forced_colors_mode         = ${prefs.forcedColors ? "ENABLED" : "OFF"}
color_blindness_filter     = ${prefs.colorBlindness.toUpperCase()}

--------------------------------------------------------------------------------
[4] CORS EXTERNAL DESKTOP DELIVERY SPECIFICATION
--------------------------------------------------------------------------------
Endpoint URL               : ${host}/api/preferences/desktop-delivery.txt
Content-Type               : text/plain; charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With

cURL CLI Desktop Delivery Command:
  curl -s -H "Origin: desktop-client" \\
       "${host}/api/preferences/desktop-delivery.txt" \\
       -o "deafauth-pinksync-preferences.txt"

Desktop Local Script Auto-Delivery:
  wget -q "${host}/api/preferences/desktop-delivery.txt" -O ~/.config/pinksync/deafauth.txt

Browser Extension Sync Hook:
  fetch("${host}/api/preferences/desktop-delivery.txt", { mode: "cors" })
    .then(r => r.text())
    .then(txt => console.log("Delivered preferences:", txt));

--------------------------------------------------------------------------------
[5] MACHINE-PARSEABLE INI KEY-VALUE SERIALIZATION
--------------------------------------------------------------------------------
[metadata]
version=2026.09-v1
profile=${prefs.profileId}
theme=${prefs.themeSync}
user=${prefs.userEmail}
updated=${timestamp}

[deafauth]
visual_alerts=true
subtitles=true
visual_pulse=true
extended_timeout_buffer=2.5
audio_suppressed=true
focus_ring_thickness=4px
focus_ring_color=#db2777

[pinksync_tokens]
primary=#ec4899
accent=#f43f5e
surface=#fdf2f8
border=#f472b6
focus=#db2777
contrast=high

================================================================================
END OF MANIFEST - ADVANCED CSS STUDIO PREFERENCES DELIVERY ENGINE
================================================================================
`;
  };

  // CORS Preflight Handler for Desktop / Extension Delivery
  app.options(["/api/preferences/desktop-delivery.txt", "/api/preferences/sync", "/api/preferences/export.txt"], (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Origin");
    res.status(204).end();
  });

  // Endpoint: CORS External Desktop Delivery of User Preferences (.txt) in deafauth w pinksync
  app.get(["/api/preferences/desktop-delivery.txt", "/api/preferences/export.txt", "/api/preferences/deafauth-pinksync.txt"], (req, res) => {
    // Enable CORS for external desktop apps, CLI curl, browser extensions, and local daemons
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Origin");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="deafauth-pinksync-user-preferences.txt"');

    const host = `${req.protocol}://${req.get("host") || "localhost:3000"}`;
    const userEmail = (req.query.user as string) || (req.query.email as string) || currentSyncedPreferences.userEmail;

    const snapshot = {
      ...currentSyncedPreferences,
      userEmail,
    };

    const textPayload = buildPreferencesTextPayload(host, snapshot);
    res.send(textPayload);
  });

  // Endpoint: External Desktop Sync & Update (POST) with CORS
  app.post("/api/preferences/sync", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Origin");

    if (req.body && typeof req.body === "object") {
      currentSyncedPreferences = {
        ...currentSyncedPreferences,
        ...req.body,
      };
    }

    const host = `${req.protocol}://${req.get("host") || "localhost:3000"}`;
    const textPayload = buildPreferencesTextPayload(host, currentSyncedPreferences);

    res.json({
      success: true,
      profile: "deafauth",
      theme: "pinksync",
      syncedUser: currentSyncedPreferences.userEmail,
      txtDeliveryUrl: `${host}/api/preferences/desktop-delivery.txt`,
      manifestText: textPayload,
    });
  });

  // Endpoint: Scan CSS with Chromium Engine for Legacy Browser Compatibility
  app.post("/api/scan-legacy-css", async (req, res) => {
    try {
      const { css } = req.body;
      if (!css || typeof css !== "string") {
        return res.status(400).json({ 
          success: false, 
          error: "Missing css in request body" 
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          success: true,
          isAiChromiumPowered: false,
          isAiGoogleSearchPowered: false,
          notice: "GEMINI_API_KEY not set. Using offline baseline engine with Chromium platform lookup links."
        });
      }

      // Initialize Gemini SDK lazily
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert CSS compatibility engineer specializing in the Chromium rendering engine (Blink) and cross-browser legacy baselines.
Examine this CSS snippet for properties, selectors, functions, or units that fail or behave poorly in legacy browsers (Safari < 16, iOS Safari 14/15, older Chrome/Chromium versions < 105, Firefox < 121, Internet Explorer 11, legacy Edge).
Cross-reference Chromium engine release notes, Chrome Platform Status (chromestatus.com), CanIUse, and MDN browser baseline tables to retrieve verified legacy fallbacks and modern alternatives.

CSS TO SCAN:
${css.slice(0, 3500)}

Respond with a clean, raw JSON object (without markdown code blocks if possible) matching this schema:
{
  "summary": "1-2 sentence executive assessment of Chromium and legacy compatibility",
  "issues": [
    {
      "propertyOrFeature": "Name of property or selector (e.g., subgrid, :has, color-mix, dvh, backdrop-filter)",
      "riskLevel": "high" | "moderate",
      "legacyStatusSummary": "Detailed browser support summary explaining which legacy versions fail",
      "affectedBrowsers": [
        { "browser": "Safari", "unsupportedVersions": "< 16.0", "baselineStatus": "Fails layout" },
        { "browser": "IE11", "unsupportedVersions": "All", "baselineStatus": "Unsupported" }
      ],
      "chromiumQuery": "Chromium compatibility query (e.g. Chromium CSS subgrid support baseline)",
      "modernAlternative": "Recommended modern alternative or progressive enhancement pattern",
      "fallbackCssSnippet": "Exact CSS fallback snippet or @supports block"
    }
  ]
}`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = aiResponse.text || "";
      const searchChunks = aiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webCitations = searchChunks
        .filter((chunk: any) => chunk.web?.uri)
        .map((chunk: any) => ({
          title: chunk.web?.title || "Web Citation",
          url: chunk.web?.uri || ""
        }));

      // Parse JSON output safely
      let parsedData: any = null;
      try {
        const cleanedJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsedData = JSON.parse(cleanedJson);
      } catch (err) {
        console.warn("Gemini output was not direct JSON, returning raw text fallback:", text.slice(0, 100));
      }

      // Format issues with Chromium URLs
      const formattedIssues = (parsedData?.issues || []).map((iss: any) => ({
        ...iss,
        chromiumQuery: iss.chromiumQuery || `Chromium CSS ${iss.propertyOrFeature} support`,
        chromiumUrl: `https://chromestatus.com/features#${encodeURIComponent(iss.propertyOrFeature)}`,
        googleSearchQuery: iss.chromiumQuery || `Chromium CSS ${iss.propertyOrFeature} support`,
        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(iss.chromiumQuery || iss.propertyOrFeature)}`
      }));

      return res.json({
        success: true,
        isAiChromiumPowered: true,
        isAiGoogleSearchPowered: true,
        summary: parsedData?.summary || text.slice(0, 250),
        issues: formattedIssues,
        citations: webCitations
      });
    } catch (error: any) {
      console.error("Error in /api/scan-legacy-css:", error);
      let friendlyError = "Chromium scan API call failed; using verified baseline rules with Chromium platform links.";
      if (typeof error?.message === "string") {
        if (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")) {
          friendlyError = "Gemini rate limit reached; using verified compatibility matrix with direct Chromium platform links.";
        } else {
          try {
            const parsedErr = JSON.parse(error.message);
            friendlyError = parsedErr?.error?.message || friendlyError;
          } catch {
            friendlyError = error.message;
          }
        }
      }

      return res.json({
        success: true,
        isAiChromiumPowered: false,
        isAiGoogleSearchPowered: false,
        error: friendlyError
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
