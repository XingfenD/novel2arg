'use strict';
// The pure layout core: which edges the current filters keep visible, and where every node sits.
// No DOM, no Alpine — the self-test evaluates this file directly in node (site-graph.mjs --self-test),
// so the geometry the canvas draws is behavior-tested without a browser.
const NW = 192, NH = 54, GX = 36, GY = 92, PAD = 34;
const BUS_LANE = 9;           // back-edge lane pitch in the right-margin gutter
const BUS_LANES = 14;         // lane cap: one per distinct target, wrapping past this

// Edge routing. Forward edges drop rank to rank. Same-rank edges arc through the gap above the
// rank — a tight bump between neighbours, a wide sweep between distant cards — so the intra-rank
// chains stop sharing one detour. Back edges (pointing at a higher rank) leave the card grid
// entirely: out the source's right side, up a right-margin bus lane shared per target, into the
// target's right side. The old +70px hug used to cross every intermediate rank's cards on its way
// up, which is what made the orphan layer's 130 upward nav edges read as hair.
const edgePath = (a, b, busX) => {
  const x1 = a.x + NW / 2, y1 = a.y + NH, x2 = b.x + NW / 2, y2 = b.y;
  if (b.y > a.y + 4) return `M${x1},${y1} C${x1},${y1 + 44} ${x2},${y2 - 44} ${x2},${y2}`;
  if (b.y > a.y - 4) { const gy = a.y - GY / 2; return `M${x1},${a.y} C${x1},${gy} ${x2},${gy} ${x2},${b.y}`; }
  const bx = busX ?? Math.max(x1, x2) + NW / 2 + 14;
  return `M${x1 + NW / 2},${a.y + NH / 2} C${bx},${a.y + NH / 2} ${bx},${b.y + NH / 2} ${x2 + NW / 2},${b.y + NH / 2}`;
};

const visibleEdges = (graph, { chrome, kinds, filter }) => {
  const ids = new Set(graph.nodes.map((n) => n.id));
  return graph.edges.filter((e) => {
    if (e.from === e.to) return false;   // a nav bar's link to the current page: no graph meaning
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
  const baseWidth = Math.max(60, ...[...byRank.values()].map((l) => PAD * 2 + l.length * (NW + GX) - GX));
  const height = PAD * 2 + (Math.max(...byRank.keys()) + 1) * (NH + GY);
  const rankY = new Map([...byRank.keys()].map((r) => [r, PAD + r * (NH + GY)]));

  // right-margin bus: one lane per distinct back-edge target (wrapping at the cap), so the upward
  // edges bundle by destination instead of each hugging its own endpoint card
  const laneOf = new Map();
  let lanes = 0;
  for (const e of edges) {
    const a = pos.get(e.from), b = pos.get(e.to);
    if (!a || !b || b.y >= a.y - 4) continue;
    if (!laneOf.has(e.to)) laneOf.set(e.to, Math.min(lanes++, BUS_LANES - 1));
  }
  const busX0 = baseWidth + 14;
  const width = lanes ? busX0 + Math.min(lanes, BUS_LANES) * BUS_LANE + 6 : baseWidth;
  const paths = new Map();
  for (const e of edges) {
    const a = pos.get(e.from), b = pos.get(e.to);
    if (!a || !b) continue;
    paths.set(e, edgePath(a, b, lanes ? busX0 + (laneOf.get(e.to) ?? 0) * BUS_LANE : null));
  }
  return { pos, byRank, rankY, width, height, paths };
};
