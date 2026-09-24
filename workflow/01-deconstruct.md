# Step 1 — Deconstruct the Novel

**Input:** novel text path. **Output:** `docs/deconstruction.md`, five tables. A sample of the expected artifact shape: examples/deconstruction-excerpt.md.

**Large novels.** When the novel runs past roughly 150,000 tokens, split it at chapter boundaries and dispatch
one subagent per chunk — the chunk reads run in parallel. Each reads only its slice and writes provisional
rows (all five tables' rows for that chunk, against the definitions below) to `docs/deconstruction.chunk-N.md`.
When the last chunk returns, one merge round consolidates the chunk files into `docs/deconstruction.md`: merge
the character network, order the timeline, de-duplicate the evidence inventory, fold in the contrast-matrix
and twist-ordering rows. Chunk rows are provisional until the merge; the deliverable is still the five finished
tables in one file, never per-chunk fragments. The threshold exists because the exhaustive extraction below is
the point of this step, and it needs headroom in the same context that holds the novel. Below the threshold a
single subagent reads the novel in one pass and writes `docs/deconstruction.md` directly.

| Table | Contents |
|---|---|
| Character network | Per character: surface identity, secret identity, and life traces — every date, number, nickname, habit, license plate, employee ID, and document they appear in. |
| Timeline | Two columns: story order and player discovery order. The two must differ. |
| Evidence document inventory | Every document the novel supports mocking: diary, medical record, contract, bank statement, chat log, court ruling, announcement, staff roster, notice. |
| Surface/secret contrast matrix | Each surface entity, its secret-layer reversal, and the bridging prop that stitches the two (a contract, a photo, a transaction record). |
| Twist ordering | Twists listed in player discovery order, with the central twist page marked. |

Life traces drive everything downstream. They are the raw material for the puzzle audit in step 5 and for the neutral public pages specified in step 3. Extract them exhaustively here; a trace invented at implementation time reads as invented.

Mark which characters appear on public pages (roster, department list, news) and what that organization would legitimately publish about each. Step 3 needs this to keep public pages neutral.

Baseline-test traps for this step: references/common-mistakes.md §1 — check them before returning the artifact.
