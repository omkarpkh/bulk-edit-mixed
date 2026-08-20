# Why these criteria, and why these scores

A rubric is a design artifact. It encodes what you think matters before you know which option
wins, which is the only point at which you can choose honestly. This is the record of those
choices — including the ones I got wrong.

---

## Part 1 — Where the criteria came from

Three sources, because no single one was sufficient.

**Nielsen Norman's ten heuristics** give generic usability coverage, but they were written for
interfaces in general and say nothing about the specific thing that makes bulk edit hard: that the
objects being changed do not currently agree with each other.

**The seven hard cases** are domain-specific and were written before any concept existed — mixed
values, method-per-field-type, no-op honesty, per-item preview, partial failure, scope honesty,
keyboard. They are the actual job.

**Craft-piece fitness** exists because this artifact has a second audience. It has to work as an
interface *and* survive as portfolio evidence, and a shape that cannot be screenshotted or shipped
fails at the second job regardless of how it scores at the first.

### What I took from Nielsen, and what I left

| Heuristic | Decision | Reasoning |
|---|---|---|
| 1 · Visibility of system status | **Kept**, split into A2/B2/C1 | The central failure of bulk edit is a confident interface hiding what it is about to do. One criterion could not carry it, so it became three. |
| 2 · Match with the real world | **Dropped** | All six concepts use the same fixture vocabulary — hosts, tags, environment. The vocabulary was settled upstream in the state model (`add`/`remove`/`set`), so this cannot discriminate between shapes. Scoring it would produce six identical numbers. |
| 3 · User control and freedom | **Kept** as B4 | Bulk operations are the case where "undo" stops being a nicety. |
| 4 · Consistency and standards | **Dropped as a score, kept as a constraint** | Consistency here is internal, and each concept is a single frame — there is nothing yet to be inconsistent *with*. Scoring it would punish incompleteness rather than design quality. The real inconsistency (three dark frames, three light, two product names) went into the round-2 craft bar as a requirement instead. |
| 5 · Error prevention | **Kept**, split into A3/B1 | The highest-stakes heuristic for this problem, so it earns two criteria and a ×3 weight. |
| 6 · Recognition over recall | **Kept** as A1/C1 | "What is the current value" is the question bulk edit answers worst. |
| 7 · Flexibility and efficiency | **Kept** as D1/D2/D3 | This is a tool used repeatedly by the same person, not a first-run experience. |
| 8 · Aesthetic and minimalist design | **Kept, but reframed** as C3 and E1 | "Aesthetic" scored directly is a taste judgement and unfalsifiable. Reframed into two testable questions: does it still work at 1,000 rows, and does a screenshot explain itself. |
| 9 · Recognise, diagnose, recover from errors | **Kept** as B3 | Partial failure is the specific error state this domain produces. |
| 10 · Help and documentation | **Dropped** | There is no documentation at concept stage, and a bulk-edit control that needs help text has already failed. Anything this would catch is caught by A1 and E1. |

### What I deliberately did not measure

- **Visual aesthetics and brand.** Unfalsifiable at concept stage, and scoring it rewards the
  best-rendered frame rather than the soundest shape. Four of these six were rendered by the same
  agent in one pass; the render quality is noise, not signal.
- **Novelty.** Bulk edit is a well-trodden pattern space. Originality for its own sake is a risk
  here, not a virtue — an unfamiliar shape costs recognition (NN#6) and buys nothing.
- **Accessibility beyond keyboard.** Contrast, labelling and screen-reader semantics are build-time
  correctness requirements that apply identically to all six. They do not discriminate, so scoring
  them adds length without adding information. Keyboard operability *is* scored, because the
  interaction shapes differ in how well they afford it.
- **Click count as a headline metric.** Included as D3 but weighted low and deliberately not
  elevated. The fewest-clicks concept in this set is also one of the least honest, and optimising
  click count on a destructive, irreversible, multiplied operation is optimising the wrong thing.
  Speed is a virtue in the common case and a hazard in the destructive one.

### Why the weights

**Honesty ×3.** The piece exists because bulk edit lies — a blank field implying "no value" when
the truth is "twelve different values". If a concept is dishonest, being faster or prettier makes
it worse, not better, because it accelerates a wrong action. Everything else is subordinate.

**Error prevention and recovery ×3.** A single-item form that errs damages one object. This damages
every selected object simultaneously, and the damage is often not visible afterwards. The
asymmetry between the cost of a mistake here and in ordinary CRUD is the entire reason this is a
hard problem.

**Cognitive load, efficiency, craft fitness ×2 each.** Real, and genuinely load-bearing, but each
is in service of the two above. A tool that is effortless and fast and lies is not a good tool.

---

## Part 2 — Why each criterion, specifically

**A1 · Mixed-value visibility.** The founding problem. Every product I have used shows a blank
field or the first item's value; both are lies, and the second is the more dangerous because it
looks like data. Scores the aggregate view: can you see the distribution of what exists before you
replace it. *Alternative rejected:* "does it show mixed state at all" — too binary. Showing "Mixed"
is table stakes; showing *what the mixture is* is the design.

**A2 · No-op honesty.** Distinguishing "11 will change, 1 already matches" from "12 updated". This
is the criterion I expected to discriminate most and it did the opposite — see Part 4.

**A3 · Scope honesty.** Bulk edit breaks at select-all. "12 selected" on this page versus 1,847
matching the filter is the difference between a routine edit and an incident. *Alternative
rejected:* scoring selection UI generally — the mechanism is uninteresting; the ambiguity is the
whole risk.

**B1 · Destructive treatment.** `replace` and `clear` destroy information that `add` and `remove`
do not. Scores whether the guard is proportional to the damage. *Alternative rejected:* "has a
confirmation dialog" — confirmation dialogs are the laziest possible answer and are clicked
through reflexively. What matters is whether the destructive path *looks* different from the safe
one before you commit to it.

**B2 · Per-item preview.** The signature moment of the whole piece. *Alternative rejected:* "shows
a summary of changes" — a summary is an assertion; a per-item diff is evidence. The distinction is
the point.

**B3 · Partial failure.** Nine of twelve succeeded. Where do the three go, and can you retry only
those? Included despite knowing no concept addressed it, precisely because a rubric that only asks
questions the options already answer is a rubric designed to confirm a decision already made.

**B4 · Reversibility.** Undo, or an explicit stated position on why not. Silence scores 0.

**C1 · Recognition over recall.** Is current state visible *while* configuring, rather than
remembered from the previous screen.

**C2 · Locality.** Distance between the control and the data it changes. This is the criterion I
think matters most and is least discussed in bulk-edit design — every concept that puts the
builder in one place and the preview in another creates a moment where you are reviewing a
*representation* of your change rather than the change itself. Occlusion counts against it: a
popover covering the rows it edits is worse than one that does not.

**C3 · Legibility at scale.** Does it hold at 12 rows and at 1,000. Bulk edit is uninteresting at
12; the whole point is the case where you cannot check by hand. *Alternative rejected:* performance
or virtualisation — that is engineering, and it does not distinguish these shapes.

**D1 · Keyboard operability.** Someone doing this fifty times a day will never touch the trackpad.

**D2 · Multi-operation composition.** Can you change more than one field per pass. Weighted inside
efficiency rather than treated as its own category, which is a judgement call that turns out to
matter — see Part 4.

**D3 · Steps to a simple edit.** The common case should be cheap. Weighted low, deliberately.

**E1 · Five-second legibility.** A hiring manager gives a portfolio image about five seconds. If
the screenshot needs a paragraph, the interface probably does too.

**E2 · Implementation cost.** As a self-contained web component, since it must run inside Angular
at work and on a portfolio page without a build step. Lower cost scores higher — an elegant shape
that never ships is worth less than a good one that does.

**E3 · Portability.** Framework independence.

---

## Part 3 — Why these numbers

Anchors: **0** absent and the shape resists it · **1** absent but the shape affords it ·
**2** present but partial or compromised · **3** present and the best answer in the set.

Only the discriminating criteria are argued below. Where every concept scored identically, the
criterion did no work in the decision and saying more would be padding — that is itself discussed
in Part 4.

### A1 · Mixed-value visibility

| | | |
|---|:--:|---|
| 2 · side panel | **3** | Stacked distribution bar per field — 6 Prod / 3 Stage / 3 Dev — plus "hosts currently contain 18 distinct tags across selection". The only concept that quantifies the mixture rather than labelling it. |
| 6 · popover | **3** | Same distribution bar, scoped to one column. Equally honest, narrower reach. |
| 4 · modal | **3** | Different answer, equally good: renders `prod \| staging \| dev` inside the cell itself. Per-row rather than aggregate, but it does not lie. |
| 1 · inline bar | **2** | Current values are visible per row via strikethrough, so nothing is hidden — but there is no aggregate. You can see twelve individual truths and not the shape of them. Partial, not absent. |
| 3 · batch builder | **2** | Before→after per row in the comparison pane. Same limitation, and one step further from the source data. |
| 5 · inline rows | **2** | Current value in the collapsed row, proposed in the expansion. Same partial answer. |

### B2 · Per-item preview before commit

| | | |
|---|:--:|---|
| 1 · inline bar | **3** | Diff rendered in the real table row, live, with no separate step. The strongest instance because there is no preview *artifact* to be out of date. |
| 3 · batch builder | **3** | Full proposed-state comparison across all rows and all queued operations. Equally complete; loses on locality, not on preview. |
| 4 · modal | **3** | Strikethrough previous, bold proposed, in the cell being edited. |
| 5 · inline rows | **2** | Per-row expansion showing `staging → prod`. Correct but costly — it doubles row height, so the preview competes with the data for space. |
| 6 · popover | **2** | "Individual impact preview" exists but is collapsed by default and truncated to three of twelve rows. Present, compromised. |
| 2 · side panel | **1** | "Preview 12 Changes" is a *button*. The preview is deferred to a screen we have not seen, which is exactly the build-here-check-there split this criterion was written to detect. Scores 1 rather than 0 because the panel affords showing it inline. |

### C2 · Locality

| | | |
|---|:--:|---|
| 1 · inline bar | **3** | Control docked directly above the table; effect rendered in the row. Shortest possible distance between cause and effect. |
| 5 · inline rows | **3** | Change appears inside the row it modifies. Equally local. |
| 2 · side panel | **2** | Beside the data, not on it. Honest but the eye travels, and the panel's field order does not correspond to the table's column order. |
| 3 · batch builder | **2** | Queue left, preview right, and the preview is a separate table from the one you selected in. |
| 6 · popover | **2** | Excellent *mental model* — it descends from the column header, so "I am editing this column" is unambiguous — but it physically occludes the rows it is editing. The idea scores 3; the execution costs a point. |
| 4 · modal | **1** | A modal over the table. Maximum distance: the data is behind the thing changing it, greyed out and unreadable. |

### C3 · Legibility at scale

| | | |
|---|:--:|---|
| 1 · inline bar | **3** | Per-row diffs and a docked bar are indifferent to row count. |
| 2 · side panel | **3** | Distribution bars *improve* with scale — an aggregate of 1,000 is more useful than an aggregate of 12. The only concept that gets better as the problem gets harder. |
| 3 · batch builder | **2** | The queue scales; the full comparison table does not — reviewing 1,000 proposed rows is not review, it is scrolling. |
| 6 · popover | **2** | The control is fixed-size and scales fine; the truncated preview list does not. |
| 5 · inline rows | **1** | Expansion doubles row height. At 1,000 rows with 900 changing, the table is unreadable. |
| 4 · modal | **1** | A scrolling modal over a scrolling table. Worst case in the set. |

### B4 · Reversibility

| | | |
|---|:--:|---|
| 3 · batch builder | **2** | "Discard Batch" is a real pre-commit escape, and the queue means an operation can be removed before it lands. Nothing post-commit, so not a 3. |
| 4 · modal / 6 · popover | **1** | Cancel exists, which is escape but not undo. |
| 1 · inline bar / 2 · side panel / 5 · inline rows | **0** | No stated position at all. Scored 0 rather than 1 because the shapes commit immediately on Apply, so undo would have to be introduced as a new surface rather than occupying an existing gap. |

### D2 · Multi-operation composition

| | | |
|---|:--:|---|
| 3 · batch builder | **3** | An explicit queue of three operations executed together. The only concept that treats "change several things" as the unit of work. |
| 2 · side panel | **3** | Environment, tags and monitoring configured in one pass. Different mechanism, same capability. |
| 1, 4, 5, 6 | **1** | One field at a time. Scored 1 not 0 — nothing in these shapes forbids a second operation, they simply do not model it. |

### E1 · Five-second legibility

| | | |
|---|:--:|---|
| 1 · inline bar | **3** | Twelve rows of struck-through old values beside new ones. The image states the idea without a caption. |
| 2 · side panel | **3** | The distribution bars are visually distinctive and self-explaining. |
| 6 · popover | **3** | Clean, single-purpose, obvious. |
| 3 · batch builder | **2** | Dense. "3 actions queued affecting 11 hosts" reads well, but the two-pane layout needs a beat to parse. |
| 4 · modal | **1** | Renders four rows of twelve and leaves half the canvas empty. |
| 5 · inline rows | **1** | Same failure, more severe — four rows and roughly 60% empty canvas. |

**A note on 4 and 5.** Their E1 scores punish rendering, not thinking, and that is a deliberate
inconsistency with the "structural affordance, not draftsmanship" rule used everywhere else. The
justification: E1 measures the artifact's fitness as portfolio evidence, and for that purpose the
render *is* the thing being judged. Flagged here because it is the one place the method bends.

### A3, B3, D1 · The flat criteria

Scored 1 or 0 almost universally. Individual justification would be repetition: no concept shows
select-all scope, partial failure, or keyboard operation. Direction 5 earns a 2 on A3 for the
`[Compressed row]` treatment of unselected items, which at least makes the boundary of the
selection visible. Direction 4 earns a 2 on D1 because direct cell editing implies tab-and-type
whether or not the frame says so.

Direction 3 is the one case where a flat criterion hides a real difference: **"execute atomic
batch" makes partial failure conceptually harder to add later**, since atomicity promises
all-or-nothing. It still scores 1 rather than 0 — the queue could carry per-operation status — but
it is the only concept where the stated model actively argues against the missing capability.

---

## Part 4 — Where the rubric failed

**Two criteria did no work.** C1 (recognition over recall) and E3 (portability) scored 3 across all
six. A criterion that never separates anything is not a criterion, it is a precondition. They
should have been stated as entry requirements — "any concept must show current state and must be
framework-independent" — and the rubric should have started after that filter.

**Three criteria did enormous work by being flat in the other direction.** A3, B3 and D1 scored 1
or 0 almost universally. This looks statistically identical to C1 and E3 — a column of near-identical
numbers — and means the opposite. Flat-because-everyone-passes is a wasted criterion. Flat-because-
everyone-fails is the most valuable output the rubric produced, because it identifies a blind spot
shared by six independently generated options. **Those three became the round-2 brief.**

**The weighting decided the winner, and it was close.** Directions 1 and 3 finish 80 to 78. The gap
is entirely explained by two choices: placing multi-operation composition *inside* efficiency (×2)
rather than treating it as its own category, and weighting implementation cost at all. Move
multi-op to its own ×3 category and direction 3 wins. That is not a flaw to hide — it is the
decision. **The rubric did not choose the winner; the weights did, and the weights are an
argument about what this tool is for.** If the real job is "change three fields at once," the
weights are wrong and so is the answer.

**Scoring my own preferred option is a conflict of interest.** I recommended combining directions
1 and 2 before building the rubric, and the rubric then ranked them 1st and 3rd. The two most
motivated-looking cells are direction 3's build cost (1) and steps-to-simple-edit (1). Both are
defensible and both are judgement. If those two cells move, it is a tie.
