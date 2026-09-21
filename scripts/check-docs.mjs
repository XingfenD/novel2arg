// Docs self-check for this skill repo. Validates, across every *.md file:
//   1. file-path references resolve (references/…, workflow/…, examples/…, scripts/…, assets/…, SKILL.md);
//   2. section citations — "file.md §N" and "§N.M" (M = numbered list item inside section N) — point at
//      sections that exist. A section is a "## " heading whose text starts with a number ("## 4. …") or
//      "Step <number>" ("## Step 4 — …");
//   3. rule-ID citations (Rn) are defined in the canonical table of references/guardrails.md;
//   4. relative markdown links [text](path) resolve;
//   5. no orphan docs: every workflow/, references/, examples/ file is reachable by name from SKILL.md.
// Usage: node scripts/check-docs.mjs   (run from the repo root; also wired into .github/workflows/ci.yml)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const ROOT = process.cwd();
const rel = (p) => relative(ROOT, p).split('\\').join('/');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const mdFiles = walk(ROOT).filter((f) => f.endsWith('.md'));
const text = new Map(mdFiles.map((f) => [rel(f), readFileSync(f, 'utf8')]));

/* ── Section numbers per file: "## 4. …" or "## Step 4 — …" → 4; plus each section's list-item numbers ── */
const sections = new Map();   // file → Map(n → Set of list-item numbers)
for (const [file, t] of text) {
  const map = new Map();
  let current = null;
  for (const line of t.split('\n')) {
    const h = line.match(/^##\s+(?:Step\s+)?(\d+)[.\s—-]/);
    if (h) { current = Number(h[1]); map.set(current, new Set()); continue; }
    if (/^##\s/.test(line)) { current = null; continue; }
    if (current !== null) {
      const item = line.match(/^\s*(\d+)\.\s+\S/);
      if (item) map.get(current).add(Number(item[1]));
    }
  }
  sections.set(file, map);
}

/* ── Defined rule IDs: guardrails.md canonical table rows "| R7 | …" ── */
const guardrails = text.get('references/guardrails.md') ?? '';
const definedRules = new Set([...guardrails.matchAll(/^\|\s*R(\d{1,2})\s*\|/gm)].map((m) => Number(m[1])));

const fails = [];
const fail = (file, msg) => fails.push(`${file}: ${msg}`);

const resolveMd = (fromFile, ref) => (ref.includes('/') ? ref : join(dirname(fromFile), ref));

for (const [file, t] of text) {
  /* 1. path references (any mention of a known-top-level path or bare *.md filename) */
  for (const m of t.matchAll(/(?:^|[\s`([「『"])((?:references|workflow|examples|scripts|assets)\/[\w./-]+\.(?:md|mjs)|SKILL\.md)/g)) {
    const p = m[1].replace(/[.,;:)"'」』]+$/, '');
    if (!existsSync(join(ROOT, p))) fail(file, `path not found: ${p}`);
  }

  /* 2. section citations: "file.md §N[.M]" or bare "§N[.M]" (same file) */
  for (const m of t.matchAll(/((?:[\w./-]+\/)?[\w.-]+\.md)?[`\s]*§(\d{1,2})(?:\.(\d{1,2}))?/g)) {
    const target = m[1] ? resolveMd(file, m[1].replace(/[.,;:)"'」』]+$/, '')) : file;
    if (!text.has(target)) { fail(file, `citation target not found: ${target} (§${m[2]})`); continue; }
    const secs = sections.get(target);
    const n = Number(m[2]);
    if (!secs.has(n)) { fail(file, `${target} has no section §${n}`); continue; }
    if (m[3] && !secs.get(n).has(Number(m[3]))) fail(file, `${target} §${n} has no list item ${m[3]}`);
  }

  /* 3. rule-ID citations */
  for (const m of t.matchAll(/\bR(\d{1,2})(?![\d.])/g)) {
    const n = Number(m[1]);
    if (!definedRules.has(n)) fail(file, `rule ID R${n} is not defined in references/guardrails.md`);
  }

  /* 4. relative markdown links */
  for (const m of t.matchAll(/\]\(([^)\s]+)\)/g)) {
    const link = m[1];
    if (/^(https?:|mailto:|#|tel:)/i.test(link)) continue;
    const p = resolve(dirname(join(ROOT, file)), link.split('#')[0]);
    if (link.split('#')[0] && !existsSync(p)) fail(file, `markdown link not found: ${link}`);
  }
}

/* 5. orphan docs: every workflow/, references/, examples/ file must be named in SKILL.md */
const skill = text.get('SKILL.md') ?? '';
for (const file of text.keys()) {
  if (!/^(workflow|references|examples)\//.test(file)) continue;
  if (!skill.includes(file)) fail('SKILL.md', `orphan doc (never routed): ${file}`);
}

if (fails.length) {
  console.error(`check-docs FAILED — ${fails.length} problem(s):`);
  for (const f of fails) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`check-docs ok — ${text.size} md files · ${definedRules.size} rule IDs · paths, §citations, rule IDs, links, orphans all clean`);
