'use strict';
// The ledger rail: one panel, two modes. Detail renders the selected node/edge through pure HTML
// builders; problems renders the graph's own defect list grouped by type. The panel is a string
// bound with x-html — Alpine initializes the @click directives inside it, so every row commands
// the canvas through the store's view API instead of reaching into its DOM.
onAlpineInit(() => Alpine.data('rail', () => ({
  panel: '',

  init() {
    this.$watch('$store.graph.selection', () => this.build());
    this.$watch('$store.graph.mode', () => this.build());
    this.build();
  },

  build() {
    const store = this.$store.graph;
    if (store.mode === 'problems') { this.panel = this.problemsHtml(); return; }
    const sel = store.selection;
    this.panel = !sel ? this.emptyHtml() : sel.kind === 'edge' ? this.edgeHtml(sel.obj) : this.nodeHtml(sel.obj);
  },

  /* the rows below call these two; both go through the canvas API the store carries */
  pulseSrc(page) { this.$store.graph.view?.pulse(page); },
  jumpTo(id) { this.$store.graph.jump(id); },

  guardHtml(guard) {
    if (!guard) return '<div class="kv"><b>guard:</b> none — free traversal</div>';
    let h = `<div class="kv"><b>guard:</b> ${esc(guard.type)}</div>`;
    if (guard.type === 'credential') {
      guard.fields.forEach((f, i) => {
        if (f.via === 'verbatim') h += `<div class="kv">field ${i + 1}: ${esc(JSON.stringify(f.plain))} ← ${f.sources.map((s) => `<span class="src" @click="pulseSrc('${esc(s.page)}')">${esc(s.page)}</span>${afterGate(s)}`).join(' + ')}</div>`;
        else if (f.via === 'derived') h += `<div class="kv">field ${i + 1}: derived — rule: ${esc(f.rule)} ← ${f.components.map((c) => `<span class="src" @click="pulseSrc('${esc(c.page)}')">${esc(c.text)} @ ${esc(c.page)}</span>`).join(' + ')}</div>`;
        else h += `<div class="kv">field ${i + 1}: <b>NO CLUE</b></div>`;
      });
    }
    if (guard.type === 'keyword') h += `<div class="kv">keyword: ${esc(guard.keyword ?? guard.hash)} ← ${guard.sources.map((s) => `<span class="src" @click="pulseSrc('${esc(s.page)}')">${esc(s.page)}</span>`).join(' + ')}</div>`;
    if (guard.requires?.length) h += `<div class="kv">requires: ${esc(guard.requires.join(', '))} (granted by ${(guard.grantedBy ?? []).map((g) => `<span class="src" @click="pulseSrc('${esc(g)}')">${esc(g)}</span>`).join(', ') || 'nothing'})</div>`;
    return h;
  },

  edgeHtml(e) {
    return `<h2>${esc(e.from)} → ${esc(e.to)}</h2>
      <div class="caption">一条跳转边 · ${KIND_LABEL[e.kind] ?? e.kind}${e.chrome ? '（框架边）' : ''}</div>
      <h3>证据与判据</h3>
      <dl class="frow">
        <dt>evidence</dt><dd>${esc(e.evidence)}</dd>
        <dt>kind</dt><dd>${esc(e.kind)}</dd>
        <dt>route</dt><dd>${e.route ?? '—'} · ${esc(e.routeClaim)}</dd>
        <dt>进度 Δ</dt><dd>${e.progressDelta ?? '—'}${e.backJump ? ' <span style="color:var(--stamp)">回跳，需复核</span>' : ''}</dd>
      </dl>
      <h3>守卫</h3>${this.guardHtml(e.guard)}`;
  },

  nodeHtml(n) {
    const bits = [n.role ?? '—', `跳数 ${n.hops ?? '—'}`, n.reachable ? '可达' : '不可达'];
    return `<h2>${esc(n.id)}</h2>
      <div class="caption">${esc(bits.join(' · '))}</div>
      <h3>页面</h3>
      <dl class="frow">
        <dt>title</dt><dd>${esc(n.title ?? '—')}</dd>
        <dt>进度</dt><dd>${esc(n.progress.raw ?? '—')} · ${esc(n.progress.source)}${n.progress.anomalous ? ' <span style="color:var(--stamp)">异常</span>' : ''}</dd>
        ${n.gate ? `<dt>门禁</dt><dd>${n.gate.fields.length} 项 · grants ${esc(n.gate.grants.join(', ') || '—')}</dd>` : ''}
        ${n.access.length ? `<dt>账号</dt><dd>${esc(n.access.join(', '))}</dd>` : ''}
      </dl>
      ${n.supplies.length ? `<h3>本页供给</h3>` + n.supplies.map((s) => `<div class="kv">${esc(s.kind)}: ${esc(JSON.stringify(s.plain))}${s.afterGate ? ' <span class="hint">（过本页门禁后）</span>' : ''}</div>`).join('') : ''}`;
  },

  emptyHtml() {
    return `<p class="empty">点节点或边，看它的判据。</p>
      <p class="hint">触控板双指滑动 / 滚轮平移画布，捏合 / ctrl+滚轮缩放，<b>+ − 复位</b> 控制视图，<b>适应宽度</b> 可看全图。<br>
      左侧色条是页面的性质：粗红=门禁，蓝虚线=搜索页，红虚线=不可达。<br>
      右下角 <span style="font-family:var(--mono)">#n/总</span> 是 M7 的阅读顺序。</p>`;
  },

  problemsHtml() {
    const groups = new Map();
    for (const p of this.$store.graph.problems) {
      if (!groups.has(p.type)) groups.set(p.type, []);
      groups.get(p.type).push(p);
    }
    return '<h2>问题清单</h2><div class="caption">图自己报的疑点，点一条跳到对应节点。</div>' + (this.$store.graph.problems.length
      ? [...groups].map(([type, list]) => `<h3>${esc(type)} · ${list.length}</h3>` + list.map((p) => {
          const id = p.page ?? p.node ?? p.detail ?? '';
          const label = p.page ?? p.node ?? p.detail ?? p.edge ?? p.url ?? '';
          return `<div class="prob" @click="jumpTo('${esc(id)}')">${esc(label)}${p.fields ? ' [' + esc(p.fields.join(', ')) + ']' : ''}</div>`;
        }).join(''))
      : '<p class="empty">none</p>');
  },
})));
