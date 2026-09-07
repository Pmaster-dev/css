import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  Layers, 
  Code2, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode, 
  Globe, 
  Cpu, 
  ArrowRight,
  Filter,
  Play,
  RotateCcw
} from 'lucide-react';
import { DOC_REGISTRY_ENTRIES, DocRegistryEntry, DocProvider } from '../data/docRegistryData';
import { sanitizeHtmlWithSetHtml, SanitizerReport } from '../utils/domSanitizer';

interface DocRegistryManagerProps {
  onMountBlockToStudio: (block: { name: string; html: string; css: string }) => void;
  onInjectCssSnippet: (cssSnippet: string) => void;
}

export const DocRegistryManager: React.FC<DocRegistryManagerProps> = ({
  onMountBlockToStudio,
  onInjectCssSnippet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'all' | DocProvider>('all');
  const [selectedSpecLevel, setSelectedSpecLevel] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<DocRegistryEntry>(DOC_REGISTRY_ENTRIES[0]);
  const [activeView, setActiveView] = useState<'catalog' | 'dom-process' | 'endpoint'>('catalog');
  
  // Endpoint Simulator State
  const [endpointInput, setEndpointInput] = useState('/api/docs/whatwg/dom/sethtml');
  const [endpointResponse, setEndpointResponse] = useState<DocRegistryEntry | null>(DOC_REGISTRY_ENTRIES[0]);
  const [isFetching, setIsFetching] = useState(false);
  const [latency, setLatency] = useState<number>(14);

  // setHTML DOM Process Sandbox State
  const [sandboxHtmlInput, setSandboxHtmlInput] = useState<string>(
    DOC_REGISTRY_ENTRIES[0].domProcessingSnippet?.html || ''
  );
  const [sandboxCssInput, setSandboxCssInput] = useState<string>(
    DOC_REGISTRY_ENTRIES[0].domProcessingSnippet?.css || ''
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sanitize report in real-time
  const sanitizerReport: SanitizerReport = useMemo(() => {
    return sanitizeHtmlWithSetHtml(sandboxHtmlInput);
  }, [sandboxHtmlInput]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return DOC_REGISTRY_ENTRIES.filter((entry) => {
      const matchesProvider = selectedProvider === 'all' || entry.provider === selectedProvider;
      const matchesSpec = selectedSpecLevel === 'all' || entry.specLevel === selectedSpecLevel;
      const matchesSearch = 
        searchQuery.trim() === '' ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProvider && matchesSpec && matchesSearch;
    });
  }, [selectedProvider, selectedSpecLevel, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFetchEndpoint = (endpointPath: string) => {
    setIsFetching(true);
    const found = DOC_REGISTRY_ENTRIES.find((e) => e.endpoint.toLowerCase() === endpointPath.toLowerCase()) 
      || DOC_REGISTRY_ENTRIES.find((e) => e.endpoint.includes(endpointPath))
      || DOC_REGISTRY_ENTRIES[0];

    setTimeout(() => {
      setEndpointResponse(found);
      setSelectedEntry(found);
      if (found.domProcessingSnippet) {
        setSandboxHtmlInput(found.domProcessingSnippet.html);
        setSandboxCssInput(found.domProcessingSnippet.css);
      }
      setLatency(Math.floor(Math.random() * 15) + 10);
      setIsFetching(false);
    }, 200);
  };

  const handleInjectXssTestSnippet = () => {
    const maliciousSample = `<article class="sanitized-card">
  <h3>Secure User Card</h3>
  <!-- Simulated Malicious Injection Traps: -->
  <script>alert("XSS Attack!");</script>
  <img src="invalid-image" onerror="alert('Exploit')" alt="avatar" />
  <a href="javascript:void(0)" onclick="fetch('/steal-token')">Click Me</a>
  <p>Notice how the HTML Sanitizer API automatically removes all 3 execution vectors above!</p>
</article>`;
    setSandboxHtmlInput(maliciousSample);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Documentation & Open Registry Hub
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  MDN • W3C • WHATWG • GitHub
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mount living specs, CSS4 modules, and HTML5 sanitized DOM blocks directly into the Studio workbench.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveView('catalog')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeView === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Specs & Registry Blocks</span>
          </button>

          <button
            onClick={() => setActiveView('dom-process')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeView === 'dom-process'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>setHTML() DOM Sandbox</span>
          </button>

          <button
            onClick={() => setActiveView('endpoint')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeView === 'endpoint'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-500" />
            <span>API Fetch Endpoint</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SPECS & REGISTRY BLOCKS CATALOG */}
      {activeView === 'catalog' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specs, CSS4 subgrid, color-mix, setHTML, or registry blocks..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Provider Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Provider:</span>
              </div>
              {(['all', 'whatwg', 'w3c', 'mdn', 'github'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => setSelectedProvider(prov)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold uppercase transition-colors ${
                    selectedProvider === prov
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {entry.provider}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {entry.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                    {entry.description}
                  </p>

                  {/* Code snippet preview */}
                  <div className="mt-3 bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-blue-200 overflow-x-auto">
                    <pre className="line-clamp-4">{entry.syntaxExample}</pre>
                  </div>

                  {/* Browser compatibility baseline */}
                  <div className="mt-3 grid grid-cols-4 gap-1 text-[10px] text-center font-mono py-1.5 px-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Chrome</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{entry.compatibility.chrome}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Safari</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{entry.compatibility.safari}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Firefox</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{entry.compatibility.firefox}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Edge</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{entry.compatibility.edge}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={entry.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                  >
                    <span>Read Spec</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    {entry.domProcessingSnippet && (
                      <button
                        onClick={() => {
                          onMountBlockToStudio({
                            name: entry.title,
                            html: entry.domProcessingSnippet!.html,
                            css: entry.domProcessingSnippet!.css,
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mount to Studio</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: SETHTML() & DOM PROCESS SANDBOX */}
      {activeView === 'dom-process' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Native HTML Sanitizer API & setHTML() DOM Pipeline
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect how modern W3C/WHATWG DOM engines safely tokenize, sanitize, and mount untrusted markup.
              </p>
            </div>

            <button
              onClick={handleInjectXssTestSnippet}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate XSS Attack Trap</span>
            </button>
          </div>

          {/* Sanitizer Audit Status Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-500 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Security Status</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {sanitizerReport.isSafe ? 'Clean & Safe Markup' : 'Sanitized & Disarmed'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-500 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Dropped Malicious Tags</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {sanitizerReport.droppedTags.length > 0 
                    ? sanitizerReport.droppedTags.join(', ') 
                    : 'None (0 removed)'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-500 flex items-center justify-center font-bold">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Stripped Inline Handlers</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {sanitizerReport.droppedAttributes.length > 0 
                    ? `${sanitizerReport.droppedAttributes.length} neutralized` 
                    : 'None (Clean)'}
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Split View: Input vs Live Sanitized DOM Frame */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Raw HTML & CSS Input */}
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
                  <span>Untrusted Input (Simulated setHTML Source)</span>
                  <span>{sandboxHtmlInput.length} chars</span>
                </div>
                <textarea
                  value={sandboxHtmlInput}
                  onChange={(e) => setSandboxHtmlInput(e.target.value)}
                  className="w-full h-64 p-4 font-mono text-xs text-emerald-200 bg-transparent resize-none leading-relaxed outline-none"
                  placeholder="Paste or write HTML here..."
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
                  <span>Component CSS Styling</span>
                  <span>{sandboxCssInput.length} chars</span>
                </div>
                <textarea
                  value={sandboxCssInput}
                  onChange={(e) => setSandboxCssInput(e.target.value)}
                  className="w-full h-48 p-4 font-mono text-xs text-blue-200 bg-transparent resize-none leading-relaxed outline-none"
                  placeholder="/* Component styling */"
                />
              </div>
            </div>

            {/* Live Rendered Sanitized DOM Frame */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Live DOM Output (Sanitized DOM Tree)
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Element.setHTML() Active
                  </span>
                </div>

                {/* Inline scoped style tag for the preview */}
                <style dangerouslySetInnerHTML={{ __html: sandboxCssInput }} />

                {/* Live mount container rendered with clean sanitized HTML */}
                <div 
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 min-h-[220px]"
                  dangerouslySetInnerHTML={{ __html: sanitizerReport.cleanHtml }}
                />

                {/* Audit summary table */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sanitizer Execution Result:
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    Parsed using W3C Sanitizer rules. Output DOM tree contains <strong>{sanitizerReport.cleanLength}</strong> safe characters with dangerous scripts and event listeners neutralized before paint.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    handleCopy('clean-html', sanitizerReport.cleanHtml);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  {copiedId === 'clean-html' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Clean HTML</span>
                </button>

                <button
                  onClick={() => {
                    onMountBlockToStudio({
                      name: 'Sanitized DOM Component',
                      html: sanitizerReport.cleanHtml,
                      css: sandboxCssInput,
                    });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mount to Studio Canvas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: BUILT-IN DOCS & BLOCKS FETCH ENDPOINT */}
      {activeView === 'endpoint' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Built-in Documentation & Registry Fetch Endpoint
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Query standard specs, CSS4 working drafts, and registry block schemas directly over a simulated fast-edge REST endpoint.
            </p>

            {/* URL Input Bar */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-blue-300">
                <span className="text-emerald-400 mr-2 font-bold select-none">GET</span>
                <span className="text-slate-500 mr-1 select-none">https://specs.openweb.io</span>
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none border-none p-0 focus:ring-0"
                />
              </div>

              <button
                onClick={() => handleFetchEndpoint(endpointInput)}
                disabled={isFetching}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isFetching ? 'Fetching...' : 'Send Request'}</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400">Quick Endpoints:</span>
              {DOC_REGISTRY_ENTRIES.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setEndpointInput(entry.endpoint);
                    handleFetchEndpoint(entry.endpoint);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {entry.endpoint}
                </button>
              ))}
            </div>
          </div>

          {/* Response Payload Viewer */}
          {endpointResponse && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    200 OK
                  </span>
                  <span>{latency}ms</span>
                  <span>•</span>
                  <span>Content-Type: application/json</span>
                </div>
                <button
                  onClick={() => handleCopy('endpoint-json', JSON.stringify(endpointResponse, null, 2))}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-sans"
                >
                  {copiedId === 'endpoint-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'endpoint-json' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <div className="p-4 max-h-[420px] overflow-auto">
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                  {JSON.stringify(endpointResponse, null, 2)}
                </pre>
              </div>

              <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready to mount into Studio DOM engine
                </span>
                {endpointResponse.domProcessingSnippet && (
                  <button
                    onClick={() => {
                      onMountBlockToStudio({
                        name: endpointResponse.title,
                        html: endpointResponse.domProcessingSnippet!.html,
                        css: endpointResponse.domProcessingSnippet!.css,
                      });
                    }}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mount Fetched Block</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
