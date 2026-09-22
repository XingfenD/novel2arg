'use strict';
// The routing-kind legend: style + label per jump relation. Pure data — the toolbar renders the
// checkboxes from it, the canvas paints the edges from it, and the self-test asserts coverage.
// Routing kinds use dimmed register hues; chrome rules at 1px and 35% so the 378 of them recede
// into paper texture and only the fiction's own routes read as ink.
const KIND_STYLE = {
  start:        { c: '#4a7a35', w: 1.8, label: 'start' },
  nav:          { c: '#c9c9c9', w: 1,   label: 'nav' },
  footer:       { c: '#c9c9c9', w: 1,   label: 'footer' },
  breadcrumb:   { c: '#8a8578', w: 1.1, dash: '3 3', label: 'breadcrumb' },
  list:         { c: '#5a5a5a', w: 1.3, label: 'list' },
  body:         { c: '#5a5a5a', w: 1.3, label: 'body' },
  form:         { c: '#5a5a5a', w: 1.3, dash: '4 2', label: 'form' },
  'gate-next':  { c: '#8c2f24', w: 1.7, label: 'gate-next' },
  'post-unlock':{ c: '#a86a10', w: 1.5, dash: '6 3', label: 'post-unlock' },
  search:       { c: '#1f5c8b', w: 1.4, dash: '2 3', label: 'search' },
};
const KIND_LABEL = { start:'入口', nav:'主导航', footer:'页脚', breadcrumb:'面包屑', list:'列表', body:'正文', form:'表单', 'gate-next':'门禁后继', 'post-unlock':'解锁后', search:'搜索命中的' };
const kindList = () => Object.entries(KIND_STYLE).map(([id, s]) => ({ id, c: s.c, label: KIND_LABEL[id] ?? id }));
