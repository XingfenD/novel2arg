'use strict';
// The pure layout core: which edges the current filters keep visible, and where every node sits.
// No DOM, no Alpine — the self-test evaluates this file directly in node (site-graph.mjs --self-test),
// so the geometry the canvas draws is behavior-tested without a browser.
const NW = 192, NH = 54, GX = 36, GY = 92, PAD = 34;

const visibleEdges = (graph, { chrome, kinds, filter }) => {
  const ids = new Set(graph.nodes.map((n) => n.id));
  return graph.edges.filter((e) => {
    if (!KIND_STYLE[e.kind]) return false;
    if (e.chrome && !chrome) return false;
    if (!kinds[e.kind]) return false;
    if (filter && !(e.from.includes(filter) || e.to.includes(filter))) return false;
    return ids.has(e.from) && ids.has(e.to);
  });
};

// Layered layout: rank by hops (entry on top; unreachable in a trailing orphan rank), order
// within a rank by M7 progress page (reading order), then two barycenter passes over the
// visible edges to reduce crossings.
const layout = (nodes, edges) => {
  const maxHops = Math.max(0, ...nodes.map((n) => n.hops ?? 0));
  const orphanRank = maxHops + 1;
  const byRank = new Map();
  for (const n of nodes) {
    const r = n.hops ?? orphanRank;
    if (!byRank.has(r)) byRank.set(r, []);
    byRank.get(r).push(n);
  }
  const order = new Map();
  for (const list of byRank.values()) {
    list.sort((a, b) => (a.progress.page ?? 1e9) - (b.progress.page ?? 1e9) || a.id.localeCompare(b.id));
    list.forEach((n, i) => order.set(n.id, i));
  }
  for (let pass = 0; pass < 2; pass++) {
    const sum = new Map(), cnt = new Map();
    for (const e of edges) for (const [x, y] of [[e.from, e.to], [e.to, e.from]]) {
      if (!order.has(x) || !order.has(y)) continue;
      sum.set(x, (sum.get(x) ?? 0) + order.get(y)); cnt.set(x, (cnt.get(x) ?? 0) + 1);
    }
    for (const list of byRank.values()) {
      list.sort((a, b) => {
        const sa = sum.has(a.id) ? sum.get(a.id) / cnt.get(a.id) : order.get(a.id);
        const sb = sum.has(b.id) ? sum.get(b.id) / cnt.get(b.id) : order.get(b.id);
        return sa - sb || a.id.localeCompare(b.id);
      });
      list.forEach((n, i) => order.set(n.id, i));
    }
  }
  const pos = new Map();
  for (const [r, list] of byRank) list.forEach((n, i) => pos.set(n.id, { x: PAD + i * (NW + GX), y: PAD + r * (NH + GY) }));
  const width = Math.max(60, ...[...byRank.values()].map((l) => PAD * 2 + l.length * (NW + GX) - GX));
  const height = PAD * 2 + (Math.max(...byRank.keys()) + 1) * (NH + GY);
  const rankY = new Map([...byRank.keys()].map((r) => [r, PAD + r * (NH + GY)]));
  return { pos, byRank, rankY, width, height };
};
