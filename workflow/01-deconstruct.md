# Step 1 — Deconstruct the Novel

**Input:** novel text path. **Output:** `docs/deconstruction.md`, five tables. A sample of the expected artifact shape: examples/deconstruction-excerpt.md.

**Large novels.** When the novel runs past roughly 150,000 tokens, do not read it in one pass: read it in chunks at chapter boundaries, append each chunk's rows to the working tables, and run the cross-chunk passes — merge the character network, order the timeline, de-duplicate the evidence inventory — only after the last chunk. Chunk rows are provisional until the merge; the deliverable is still the five finished tables, never per-chunk fragments. The threshold exists because the exhaustive extraction below is the point of this step, and it needs headroom in the same context that holds the novel.

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
