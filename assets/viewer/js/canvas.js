'use strict';
// The SVG canvas: imperative by design — 300+ edges rebuild faster built directly than bound
// declaratively. Two watchers, two separate concerns: filters rebuild the graph, selection only
// toggles classes. The view transform lives in module scope and NO watcher reads it: a pan must
// never feed back into a rebuild that would drop the selected/pulse classes mid-interaction.
// fit = scale-to-wrap; once the reader zooms or pans, fit releases and zoom/panX/panY are theirs.
const view = { fit: true, zoom: 1, panX: 0, panY: 0 };
const BAR = 2.5;            // the ink bar on the node's left edge

onAlpineInit(() => Alpine.data('canvas', () => ({
  pos: new Map(),          // node id → layout position (current render)
  nodeEls: new Map(),      // node id → <g> (current render)
  edgeEls: [],             // { el, from, to } (current render)
  dragging: false, moved: false, drag0: null,

  init() {
    const store = this.$store.graph;
    // publish the view API once; toolbar and rail call through the store from then on
    store.view = {
      zoomBy: (f) => this.zoomBy(f),
      toggleFit: () => this.toggleFit(),
      resetView: () => this.resetView(),
      centerOn: (id) => this.centerOn(id),
      pulse: (id) => this.pulse(id),
    };
    this.$watch('$store.graph.visKey', () => this.render());
    this.$watch('$store.graph.selection', () => this.syncSelection());
    this.syncHead();
    this.render();
  },

  render() {
    const store = this.$store.graph;
    const edges = visibleEdges(store.graph, store);
    const { pos, byRank, rankY, width, height } = layout(store.graph.nodes, edges);
    this.pos = pos;
    const svg = $('#graph');
    svg.innerHTML = '';
    svg.setAttribute('width', width); svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const defs = el('defs');
    for (const [kind, s] of Object.entries(KIND_STYLE)) {
      const m = el('marker', { id: `arr-${kind}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
      const p = el('path', { d: 'M0,0 L10,5 L0,10 z' }); p.style.fill = s.c; p.style.opacity = kind === 'nav' || kind === 'footer' ? '.35' : '1';
      m.appendChild(p); defs.appendChild(m);
    }
    svg.appendChild(defs);

    // Rank rules: the hop distance is the fiction's route depth, so it gets the margin mark.
    for (const [r, y] of rankY) {
      svg.appendChild(el('line', { x1: 0, y1: y - GY / 2, x2: width, y2: y - GY / 2, class: 'grid' }));
      const t = el('text', { x: 10, y: y - GY / 2 - 5, class: 'rank-label' });
      t.textContent = `hop ${r}`;
      svg.appendChild(t);
    }

    this.edgeEls = [];
    for (const e of edges) {
      const a = pos.get(e.from), b = pos.get(e.to), s = KIND_STYLE[e.kind];
      const x1 = a.x + NW / 2, y1 = a.y + NH, x2 = b.x + NW / 2, y2 = b.y;
      let d;
      if (y2 > y1 + 4) d = `M${x1},${y1} C${x1},${y1 + 44} ${x2},${y2 - 44} ${x2},${y2}`;
      else { const mx = Math.max(x1, x2) + 70; d = `M${x1},${y1 - NH / 2} C${mx},${y1 - NH / 2} ${mx},${y2 + NH / 2} ${x2},${y2 + NH / 2}`; }
      const quiet = e.chrome;
      const p = el('path', {
        d, class: 'edge', 'marker-end': `url(#arr-${e.kind})`, 'marker-start': quiet ? '' : `url(#arr-${e.kind})`,
        'stroke-opacity': quiet ? '.35' : '1',
      });
      p.style.stroke = s.c; p.style.strokeWidth = quiet ? 1 : s.w;
      if (s.dash) p.setAttribute('stroke-dasharray', s.dash);
      p.addEventListener('click', () => { if (!this.moved) store.select('edge', e); });
      svg.appendChild(p);
      this.edgeEls.push({ el: p, from: e.from, to: e.to });
      const label = e.guard ? '🔒 ' + e.guard.type : e.kind === 'search' ? e.evidence : '';
      if (label) {
        const t = el('text', { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 4, class: 'elabel', 'text-anchor': 'middle' });
        t.textContent = label.length > 30 ? label.slice(0, 29) + '…' : label;
        svg.appendChild(t);
      }
    }

    // Nodes: a document card. Left bar = the page's own weight (gate/search/unreachable),
    // body = file name + the quiet span count / query fields, docket = M7 progress order.
    this.nodeEls = new Map();
    for (const n of store.graph.nodes) {
      if (!pos.has(n.id)) continue;
      const { x, y } = pos.get(n.id);
      const cls = ['node'];
      if (n.gate) cls.push('gate');
      if (n.isSearch) cls.push('search');
      if (!n.reachable) cls.push('unreach');
      const g = el('g', { class: cls.join(' '), transform: `translate(${x},${y})` });
      g.appendChild(el('rect', { class: 'card', width: NW, height: NH, rx: 2 }));
      g.appendChild(el('rect', { class: 'bar', x: 0, y: 0, width: BAR, height: NH, rx: 1 }));
      const { file, dir } = splitId(n.id);
      const t1 = el('text', { x: BAR + 9, y: 21, class: 'file' }); t1.textContent = file.length > 24 ? file.slice(0, 23) + '…' : file; g.appendChild(t1);
      const bits = [`hop ${n.hops ?? '—'}`];
      if (dir) bits.push(dir);
      if (n.role === 'search') bits.push('搜索页');
      if (n.gate) bits.push(n.gate.fields.length ? `门禁 ${n.gate.fields.length} 项` : '门禁');
      if (n.access.length) bits.push('账号 ' + n.access.join('/'));
      if (n.supplies.length) bits.push(`供给 ${n.supplies.length}`);
      const t2 = el('text', { x: BAR + 9, y: 38, class: 'path' }); t2.textContent = bits.join(' · ').slice(0, 40); g.appendChild(t2);
      if (n.progress.page != null) {
        const t3 = el('text', { x: NW - 9, y: NH - 9, class: 'docket' });
        t3.textContent = `#${n.progress.page}/${n.progress.total ?? '?'}`;
        g.appendChild(t3);
      }
      if (!n.reachable) {
        const t4 = el('text', { x: NW - 9, y: 16, class: 'warn' }); t4.textContent = '不可达'; g.appendChild(t4);
      } else if (n.isEntry) {
        const t4 = el('text', { x: NW - 9, y: 16, class: 'warn' }); t4.style.fill = 'var(--start)'; t4.textContent = '入口'; g.appendChild(t4);
      }
      g.addEventListener('pointerenter', () => this.hoverNode(n.id));
      g.addEventListener('pointerleave', () => this.leaveNodes());
      g.addEventListener('click', () => { if (!this.moved) store.select('node', n); });
      svg.appendChild(g);
      this.nodeEls.set(n.id, g);
    }
    this.syncSelection();
    this.applyView();
  },

  // selection only ever toggles classes — it must not rebuild the graph
  syncSelection() {
    const sel = this.$store.graph.selection;
    for (const g of this.nodeEls.values()) g.classList.remove('selected');
    if (sel?.kind === 'node') this.nodeEls.get(sel.obj.id)?.classList.add('selected');
  },

  /* ── view transform ── */
  // NOTE: render() calls applyView, so this must not READ component state either — a read here
  // becomes a render dependency, and the writes below would re-trigger the rebuild.
  applyView() {
    const svg = $('#graph');
    if (view.fit) {
      view.zoom = this.$refs.wrap.clientWidth / (Number(svg.getAttribute('width')) || 1);
      view.panX = 0; view.panY = 0;
    }
    svg.style.transform = `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})`;
    svg.style.transformOrigin = '0 0';
    this.$store.graph.fitLabel = view.fit ? '原始大小' : '适应宽度';
  },
  zoomAt(cx, cy, factor) {
    const r = this.$refs.wrap.getBoundingClientRect();
    const px = cx - r.left, py = cy - r.top;
    const z = Math.min(4, Math.max(0.2, view.zoom * factor));
    view.panX = px - (px - view.panX) * (z / view.zoom);
    view.panY = py - (py - view.panY) * (z / view.zoom);
    view.zoom = z;
    view.fit = false;
    this.applyView();
  },
  // macOS trackpad first: a plain wheel (two-finger swipe, or a mouse wheel) pans the canvas; only a
  // pinch — which every browser delivers as ctrl+wheel — zooms. Prioritising the trackpad means a
  // swipe is never hijacked into a zoom; the +/− buttons and 适应宽度 cover zoom for mouse users.
  wheel(e) {
    if (e.ctrlKey) { this.zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 1 / 1.15); return; }
    view.fit = false;
    view.panX -= e.deltaX;
    view.panY -= e.deltaY;
    this.applyView();
  },
  zoomBy(f) {
    const r = this.$refs.wrap.getBoundingClientRect();
    this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, f);
  },
  toggleFit() { view.fit = !view.fit; this.applyView(); },
  resetView() { view.fit = true; this.applyView(); },
  dragStart(e) {
    if (e.button !== 0) return;
    this.dragging = true; this.moved = false;
    this.drag0 = { x: e.clientX, y: e.clientY, panX: view.panX, panY: view.panY };
    this.$refs.wrap.classList.add('dragging');
  },
  dragMove(e) {
    if (!this.dragging) return;
    const dx = e.clientX - this.drag0.x, dy = e.clientY - this.drag0.y;
    // leave fit on the first real movement, not on pointerdown: a plain click on a node must not
    // silently detach the canvas from fit-to-width, and a pan is meaningless while fit zeroes it
    if (Math.abs(dx) + Math.abs(dy) > 4) { this.moved = true; view.fit = false; }
    view.panX = this.drag0.panX + dx; view.panY = this.drag0.panY + dy;
    this.applyView();
  },
  dragEnd() {
    this.dragging = false;
    this.$refs.wrap.classList.remove('dragging');
  },
  centerOn(id) {
    const p = this.pos.get(id);
    if (!p) return;
    const r = this.$refs.wrap.getBoundingClientRect();
    view.fit = false;
    view.panX = r.width / 2 - (p.x + NW / 2) * view.zoom;
    view.panY = r.height / 2 - (p.y + NH / 2) * view.zoom;
    this.applyView();
  },

  /* ── hover: one hop of context, everything else recedes ── */
  hoverNode(id) {
    const keep = new Set([id]);
    for (const { from, to } of this.edgeEls) {
      if (from === id) keep.add(to);
      else if (to === id) keep.add(from);
    }
    for (const [nid, g] of this.nodeEls) g.classList.toggle('dim', !keep.has(nid));
    for (const { el: p, from, to } of this.edgeEls) p.classList.toggle('dim', from !== id && to !== id);
  },
  leaveNodes() {
    for (const g of this.nodeEls.values()) g.classList.remove('dim');
    for (const { el: p } of this.edgeEls) p.classList.remove('dim');
  },
  pulse(id) {
    const g = this.nodeEls.get(id);
    if (!g) return;
    g.classList.add('pulse');
    setTimeout(() => g.classList.remove('pulse'), 1600);
  },

  // Keep the sticky-header height honest: the controls wrap on a narrow screen, and 100dvh minus a
  // hard-coded 41px would hide the bottom of the canvas behind the fold.
  syncHead() {
    document.documentElement.style.setProperty('--head', `${document.querySelector('header').offsetHeight}px`);
    if (view.fit) this.applyView();
  },
})));
