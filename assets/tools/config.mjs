// Shared project conventions for the novel2arg tools.
// The ONE file to edit when a project renames directories, layer names, markers, or the search mount —
// check-links.mjs and check-solvable.mjs both import it (knob table: references/structure/tooling.md §2).
// After editing anything the matcher depends on, re-verify with: node tools/check-solvable.mjs --self-test
const CONFIG = {
  dataDir: 'data',              // holds keywords*.src.json / keywords*.json
  pagesDir: 'pages',            // keyword-table urls are relative to this
  entry: 'index.html',          // BFS root for the solvability walk
  surfaceTable: /surface/i,     // tables matching this name are the public index
  secretUrl: /^secret\//,       // a url in a public index matching this is a layer leak
  gateHashAttr: 'data-expect-hash',                               // per-input accepted hashes (comma = synonyms)
  indexAttr: 'data-index',                                        // optional per-search-page keyword table
  grantAttr: 'data-grant',                                        // Shape C: identities a login gate authenticates
  accessAttr: 'data-access',                                      // Shape C: identities allowed to read a block
  nextAttr: 'data-next',                                          // gate target, followed after unlock
  unlockMarkers: [/x-show\s*=\s*["']unlocked["']/, /<template\s+x-if\s*=\s*["']unlocked["']/], // start of the post-gate block
  unlockEnd: '</main>',                                           // end boundary of the post-gate block
  searchMount: /x-data\s*=\s*["']search["']/,                     // page(s) mounting the search component
  maxTokenLen: 8,                                                 // character-window cap (CJK / compact tokens)
  maxPhraseWords: 4,                                              // word n-gram width (multi-word credentials)
  maxPhraseLen: 48,                                               // character cap for one candidate
};

export default CONFIG;
