'use strict';
// Masthead controls: every binding writes the store; the view buttons command the canvas through
// the API it published there. No state of its own beyond the legend the checkboxes render from.
onAlpineInit(() => Alpine.data('toolbar', () => ({
  get kinds() { return kindList(); },
  zoomBy(f) { this.$store.graph.view?.zoomBy(f); },
  toggleFit() { this.$store.graph.view?.toggleFit(); },
  showProblems() { this.$store.graph.showProblems(); },
})));
// last of the viewer's own scripts: if the runtime never loaded, say so instead of showing nothing
warnIfNoAlpine();
