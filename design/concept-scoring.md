# Mixed — round 1 concept pressure test

## Method

Six concepts, scored **0–3 per criterion** against a rubric built from Nielsen Norman's usability
heuristics, the seven hard cases this piece exists to solve, and craft-piece fitness.

**Scored on structural affordance, not draftsmanship.** Any of these frames could have another
element drawn into it. The question is not "did the agent draw X" but "does this *shape* naturally
hold X, or does adding X break it." Where a concept did not show something but has an obvious,
non-destructive place for it, it scores 1 rather than 0.

**Anchors:** 0 = absent and the shape actively resists it · 1 = absent but the shape affords it ·
2 = present but partial or compromised · 3 = present and the best answer in the set.

### Weights, and why

| Category | Weight | Reasoning |
|---|---|---|
| **A · Honesty** | ×3 | The thesis of the whole piece. If it lies about state, nothing else matters. |
| **B · Error prevention & recovery** | ×3 | NN#5, #9, #3. Bulk edit is irreversible-at-scale; this is where products fail. |
| **C · Cognitive load** | ×2 | NN#6, #8, #1. Recognition over recall, locality, legibility at scale. |
| **D · Efficiency** | ×2 | NN#7. A power-user tool run fifty times a day. |
| **E · Craft-piece fitness** | ×2 | It must also survive as portfolio evidence and ship as a web component. |

### Criteria

**A — Honesty**
- **A1 Mixed-value visibility** — can you see what you are about to overwrite, before you overwrite it? (NN#1, #6)
- **A2 No-op honesty** — does it separate will-change from already-matches? (NN#1)
- **A3 Scope honesty** — is the target set unambiguous, including select-all-beyond-this-page? (NN#1, #5)

**B — Error prevention & recovery**
- **B1 Destructive treatment** — are `replace` and `clear` guarded proportionally? (NN#5)
- **B2 Per-item preview before commit** — the signature moment. (NN#1, #5)
- **B3 Partial failure + retry-just-the-failures** — 9 of 12 succeeded, now what? (NN#9)
- **B4 Reversibility** — undo, or a stated position on why not. (NN#3)

**C — Cognitive load**
- **C1 Recognition over recall** — is current state visible *while* configuring? (NN#6)
- **C2 Locality** — is the control near the data it changes, without occluding it? (NN#8)
- **C3 Legibility at scale** — does it hold at 12 items, and at 1,000? (NN#8)

**D — Efficiency**
- **D1 Keyboard operability** — driveable without a mouse. (NN#7)
- **D2 Multi-operation composition** — more than one change per pass. (NN#7)
- **D3 Steps to a simple edit** — cost of the common case. (NN#7)

**E — Craft-piece fitness**
- **E1 Five-second legibility** — does a screenshot explain itself to a recruiter?
- **E2 Implementation cost** — as a self-contained web component. Lower cost scores higher.
- **E3 Portability** — Angular, React, plain HTML, portfolio page.

---

## Scores

| | 1 · inline command bar | 2 · side panel + distribution | 3 · full-page batch builder | 4 · modal spreadsheet | 5 · expanded inline rows | 6 · column-header popover |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| A1 mixed visibility | 2 | **3** | 2 | **3** | 2 | **3** |
| A2 no-op honesty | **3** | 2 | **3** | **3** | **3** | **3** |
| A3 scope honesty | 1 | 1 | 1 | 1 | 2 | 1 |
| B1 destructive | 2 | **3** | 2 | 2 | 1 | 1 |
| B2 per-item preview | **3** | 1 | **3** | **3** | 2 | 2 |
| B3 partial failure | 1 | 0 | 1 | 0 | 0 | 0 |
| B4 reversibility | 0 | 0 | 2 | 1 | 0 | 1 |
| C1 recognition | **3** | **3** | **3** | **3** | **3** | **3** |
| C2 locality | **3** | 2 | 2 | 1 | **3** | 2 |
| C3 scale | **3** | **3** | 2 | 1 | 1 | 2 |
| D1 keyboard | 1 | 1 | 1 | 2 | 1 | 1 |
| D2 multi-op | 1 | **3** | **3** | 1 | 1 | 1 |
| D3 steps | **3** | 2 | 1 | 1 | **3** | **3** |
| E1 5-second read | **3** | **3** | 2 | 1 | 1 | **3** |
| E2 build cost | 2 | 2 | 1 | 1 | 2 | 2 |
| E3 portability | **3** | **3** | **3** | **3** | **3** | **3** |
| **Weighted total** | **80** | **74** | **78** | **67** | **66** | **73** |
| **of 117 possible** | 68% | 63% | 67% | 57% | 56% | 62% |

---

## Verdict

> **Corrected 27 Sep 2026.** Direction 1's C3 (scale) should be 2, not 3: its layout
> survives 200 rows, but its review does not. Applied, direction 1 scores 78 of 117
> and ties direction 3, so there is no winner. The verdict below is the original, kept
> as written; the interface was built from it before the correction. See
> [omkarux.com/bulk-edit/scoring/](https://omkarux.com/bulk-edit/scoring/).

**Winner: direction 1, the inline command bar — 80/117.**

It wins on the two criteria that separate a real tool from a mockup:

- **Locality (C2 = 3).** The diff renders in the actual table row, not in a preview pane, modal or
  side panel. Every other direction asks you to build the operation in one place and check it in
  another. This one collapses the two, so there is no moment where you are reviewing a
  representation of your change rather than the change.
- **Scale (C3 = 3).** Per-row diffs and a docked bar do not degrade at 1,000 rows. Directions 4 and
  5 are unusable there — a modal you scroll, and rows that double in height.

It also has the joint-best no-op honesty and the cheapest common-case path (field → method → value →
apply).

**Runner-up: direction 3, the batch builder — 78.** Close, and it is the only direction that answers
multi-operation composition and pre-commit discard. It loses on build cost and on the same
build-here-review-there split. **Its queue idea is worth stealing; its architecture is not.**

**Direction 2 places third at 74 but owns the single best idea in the set:** the current-value
distribution bar (A1 = 3). Direction 1's weakest honesty score is exactly the gap that fills.

### The recommendation

**Build direction 1. Graft the distribution readout from direction 2 into its command bar.**
That converts direction 1's worst score (A1 = 2) into the best in the set, and the combined shape
would score **83**.

### What the scoring exposes

The winner scores **68%**. Nothing here is close to finished, and the gaps are systematic rather
than per-concept:

- **A3 scope honesty: nobody scored above 2.** Every direction says "12 selected" and none handles
  select-all-beyond-this-page. This is where real bulk edit breaks.
- **B3 partial failure: maximum score 1.** No direction shows it. Direction 3 is arguably *worse*
  than the rest here, because "execute atomic batch" implies all-or-nothing and makes partial
  failure conceptually harder to introduce later.
- **B4 reversibility: five of six score 1 or 0.**
- **D1 keyboard: nothing above 2.** For a tool run fifty times a day, this is the largest
  unexamined surface.

Four of the seven hard cases are effectively unaddressed across all six directions. That is the
round-2 brief.
