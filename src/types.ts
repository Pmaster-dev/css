export type ThemeMode = 'light' | 'dark' | 'oled' | 'high-contrast';

export type CpuMode = 'auto' | 'high' | 'balanced' | 'low-power';

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'fold';
  userAgentDescription?: string;
  hasNotch?: boolean;
}

export type IssueSeverity = 'critical' | 'warning' | 'optimization' | 'a11y' | 'cpu';

export interface ResponsiveIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  category: 'responsive' | 'cpu' | 'a11y' | 'layout';
  description: string;
  lineHint?: string;
  originalSnippet: string;
  fixedSnippet: string;
  impact: string;
}

export interface CpuMetrics {
  concurrency: number;
  deviceMemoryGb?: number;
  isBatterySaving: boolean;
  estimatedFps: number;
  paintCostMs: number;
  heavyPropertiesFound: {
    property: string;
    count: number;
    impact: 'high' | 'medium' | 'low';
    suggestion: string;
  }[];
  overallScore: number; // 0 - 100
}

export type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface A11ySettings {
  reducedMotion: boolean;
  forcedColors: boolean;
  colorBlindness: ColorBlindnessType;
  fontScale: number; // 1, 1.25, 1.5, 2
  showTouchTargetOverlay: boolean;
  highlightSmallTargets: boolean;
  highContrastFocus: boolean;
  // Deaf & Hard-of-Hearing Accessibility Defaults (deafauth profile)
  deafAuthProfile?: boolean;
  visualAlertsOnly?: boolean;
  subtitlesAndCaptions?: boolean;
  visualHapticsPulse?: boolean;
  extendedReadingBuffer?: boolean;
  // PinkSync Theme & Variables Sync
  pinkSyncEnabled?: boolean;
  userProfileEmail?: string;
}

export interface DeafAuthPinkSyncPreferences {
  version: string;
  profileId: 'deafauth';
  themeSync: 'pinksync';
  userEmail: string;
  timestamp: string;
  accessibility: {
    visualAlertsOnly: boolean;
    subtitlesAndCaptions: boolean;
    highContrastFocus: boolean;
    visualHapticsPulse: boolean;
    extendedReadingBuffer: boolean;
    reducedMotion: boolean;
    forcedColors: boolean;
    colorBlindness: ColorBlindnessType;
    fontScale: number;
    touchTargetOverlay: boolean;
  };
  pinkSyncTokens: {
    primary: string;
    accent: string;
    surface: string;
    border: string;
    focusRing: string;
    textColor: string;
  };
  corsDelivery: {
    enabled: boolean;
    allowedOrigin: string;
    endpoint: string;
    format: 'text/plain';
  };
}

export interface DesignTokens {
  fontFamilySans: string;
  fontFamilyMono: string;
  baseFontSizePx: number;
  minViewportPx: number;
  maxViewportPx: number;
  minFontSizeRem: number;
  maxFontSizeRem: number;
  fluidScaleRatio: number;
  radiusBasePx: number;
  colorSurface: string;
  colorSurfaceSubtle: string;
  colorText: string;
  colorTextMuted: string;
  colorBrand: string;
  colorBorder: string;
}

export interface CssComponentPreset {
  id: string;
  name: string;
  category: 'layout' | 'card' | 'navigation' | 'form' | 'hero';
  description: string;
  css: string;
  html: string;
  responsiveNotes: string[];
}

export type SupportRiskLevel = 'high' | 'moderate' | 'safe';

export interface AffectedBrowserDetail {
  browser: string;
  unsupportedVersions: string;
  baselineStatus: string;
}

export interface LegacySupportIssue {
  id: string;
  propertyOrFeature: string;
  matchedLineNumber?: number;
  snippet: string;
  riskLevel: SupportRiskLevel;
  legacyStatusSummary: string;
  affectedBrowsers: AffectedBrowserDetail[];
  chromiumQuery?: string;
  chromiumUrl?: string;
  googleSearchQuery?: string;
  googleSearchUrl?: string;
  caniuseUrl?: string;
  mdnUrl?: string;
  searchCitations?: {
    title: string;
    url: string;
  }[];
  modernAlternative: string;
  fallbackCssSnippet?: string;
  autoFixCode?: {
    find: string;
    replaceWith: string;
  };
}

export type CssVariableCategory = 'color' | 'spacing' | 'typography' | 'number' | 'function' | 'other';

export interface ExtractedCssVariable {
  name: string;
  value: string;
  scope: string;
  lineNumber?: number;
  category: CssVariableCategory;
  isDeclared: boolean;
  fallbackValue?: string;
  usageCount: number;
  rawDeclaration?: string;
}

export interface CompatibilityScanReport {
  timestamp: string;
  totalPropertiesScanned: number;
  highRiskCount: number;
  moderateRiskCount: number;
  safeCount: number;
  isAiChromiumPowered?: boolean;
  isAiGoogleSearchPowered?: boolean;
  issues: LegacySupportIssue[];
  searchInsights?: string;
}

