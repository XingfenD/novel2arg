# Step 1 — Story Intake

**Input:** the story source — a long-form narrative (novel / screenplay / transcript), structured setting
material (setting bible / outline / character profiles), or the user's own idea (one-line premise to a few
paragraphs of synopsis). **Output:** `docs/story-canon.md`, five tables. A sample of the expected artifact
shape: examples/story-canon-excerpt.md.

Route by source type: Adapters A and B extract and normalize, Adapter C expands. All three end at the same
five-table contract — the canon every later step reads. **Gap rule (A/B):** a row the source does not carry
is listed as an open question routed to the user through the orchestrator, never silently invented; the
agent fills a gap by invention only when the user explicitly delegates it, and marks the row by appending
`〔invented〕` to its first cell — the one marker convention across all five tables.
From step 2 on the raw source material is never read again (SKILL.md dispatch contract item 1).

## Adapter A — Long-form narrative text

Extract, never invent. **Large sources.** When the source runs past roughly 150,000 tokens, split it at
chapter or scene boundaries and dispatch one subagent per chunk — the chunk reads run in parallel. Each
reads only its slice and writes provisional rows (all five tables' rows for that chunk, against the
definitions below) to `docs/story-canon.chunk-N.md`. When the last chunk returns, one merge round
consolidates the chunk files into `docs/story-canon.md`: merge the character network, order the timeline,
de-duplicate the evidence inventory, fold in the contrast-matrix and twist-ordering rows. Chunk rows are
provisional until the merge; the deliverable is still the five finished tables in one file, never per-chunk
fragments. The threshold exists because the exhaustive extraction below is the point of this step, and it
needs headroom in the same context that holds the source. Below the threshold a single subagent reads the
source in one pass and writes `docs/story-canon.md` directly.

## Adapter B — Structured setting material

Normalize, do not invent. The orchestrator runs this adapter directly. Map the material's entries onto the
five tables under the gap rule above. Material past the ~150,000-token threshold follows Adapter A's
chunking convention.

## Adapter C — The user's own idea

The orchestrator runs this adapter directly. Expand the idea into a five-table draft: the agent invents
whatever the premise does not fix — characters, life traces, documents, twists — and marks every invented
row by appending `〔invented〕` to its first cell (the marker convention above); facts the premise itself
carries stay unmarked. Expansion serves the same
downstream needs as extraction: life traces exhaustive enough to build puzzles from (R3), and a surface
layer and a secret layer that contrast (`references/guardrails.md` Constraint 2).

## The five tables (one contract for all adapters)

| Table | Contents |
|---|---|
| Character network | Per character: surface identity, secret identity, and life traces — every date, number, nickname, habit, license plate, employee ID, and document they appear in. |
| Timeline | Two columns: story order and player discovery order. The two must differ. |
| Evidence document inventory | Every document the story supports mocking: diary, medical record, contract, bank statement, chat log, court ruling, announcement, staff roster, notice. |
| Surface/secret contrast matrix | Each surface entity, its secret-layer reversal, and the bridging prop that stitches the two (a contract, a photo, a transaction record). |
| Twist ordering | Twists listed in player discovery order, with the central twist page marked. |

Life traces drive everything downstream. They are the raw material for the puzzle audit in step 5 and for
the neutral public pages specified in step 3. Extract them exhaustively here (Adapter C: invent them
exhaustively); a trace invented at implementation time reads as invented.

Mark which characters appear on public pages (roster, department list, news) and what that organization
would legitimately publish about each. Step 3 needs this to keep public pages neutral.

## User confirmation checkpoint

Whenever the tables carry any row marked `〔invented〕` — always in Adapter C, only on delegated gap-fills
in A/B — the orchestrator presents the five tables to the user before step 2 starts; requested changes go
back to this step. Approved `〔invented〕` rows become canon; the marker stays as a record of provenance.
A pure extraction run (no marked rows) has no table-level checkpoint — the step-3 GDD review covers it.

Baseline-test traps for this step: references/common-mistakes.md §1 — check them before returning the artifact.
