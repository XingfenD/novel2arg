'use strict';
// The one shared state. Filters drive the canvas rebuild (via its visKey watcher); selection and
// mode drive the rail. The `view` slot is filled by the canvas component at init — the toolbar
// and the rail command the canvas through it, never by reaching into its DOM.
const graph = JSON.parse($('#graph-data').textContent);
const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

onAlpineInit(() => Alpine.store('graph', {
  graph,
  nodeById,
  stats: graph.stats,
  generatedAt: graph.generatedAt,
  meta: `${graph.stats.pages} 页 · ${graph.stats.edges} 边 · ${graph.stats.problems} 个疑点 · 生成于 ${graph.generatedAt}`,
  problems: graph.problems,
  chrome: true,
  kinds: Object.fromEntries(Object.keys(KIND_STYLE).map((k) => [k, true])),
  filter: '',
  fitLabel: '原始大小',
  selection: null,             // { kind: 'node' | 'edge', obj } — replaced wholesale, so the reference change is the signal
  mode: 'detail',              // 'detail' | 'problems'
  view: null,                  // { zoomBy, toggleFit, resetView, centerOn, pulse } — the canvas publishes itself here

  // one key summarising everything the canvas layout depends on: a single watcher, one concern
  get visKey() { return JSON.stringify([this.chrome, this.kinds, this.filter]); },

  toggleChrome(on) { this.chrome = on; },
  toggleKind(id, on) { this.kinds[id] = on; },
  setFilter(v) { this.filter = v; },
  select(kind, obj) { this.selection = { kind, obj }; this.mode = 'detail'; },
  showProblems() { this.mode = 'problems'; },
  jump(id) {
    const n = nodeById.get(id);
    if (!n) return;
    this.select('node', n);
    this.view?.centerOn(id);
    this.view?.pulse(id);
  },
}));
