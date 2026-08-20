# Mixed — round 2 direction

## What this is

A bulk-edit interface for changing many objects at once when **their current values differ**.
The domain is generic infrastructure: hosts with environment, region, tags, monitoring,
log retention, owner. Round 1 produced six directions. This round converges on one and takes
it to depth.

There is a working state model behind this. **It is the ground truth — the interface must
match it, not the other way round.** Where a frame and the model disagree, the model wins.

### The model, exactly

Apply methods are **a function of field type**, not a universal menu:

| Field type | Legal methods | Mixed label |
|---|---|---|
| single-select (environment, region, owner) | `set` | "Mixed" |
| multi-value (tags) | `add`, `remove`, `replace`, `clear` | "Varies" |
| boolean (monitoring) | `enable`, `disable` — **never a toggle** | "Mixed" |
| number (log retention, min 1, max 365) | `set`, `increaseBy`, `decreaseBy` | "Mixed" |

`replace` and `clear` are the only destructive methods. A toggle on mixed boolean state has no
defined meaning and must never appear. Relative numeric methods move each item from **its own**
current value and clamp to the field range — clamping can silently turn an operation into a
no-op, and that must be shown.

## Keep these — round 1 got them right

1. **No-op honesty, everywhere.** "11 will change · 1 already matches" appeared in every
   direction. That is the hardest thing to get right and it is right. Never regress to "12 updated".
2. **The inline diff in the real table** (direction 1). Strikethrough old, new value beside it,
   in the actual row — not a separate preview screen. This is the strongest single idea in the set.
3. **Current-value distribution** (directions 2 and 6). The stacked bar showing 6 Prod / 3 Stage /
   3 Dev before you overwrite it. This is the honest answer to "what am I about to destroy".
4. **The dimmed no-op row** (direction 1, `payment-gateway`) and `[Compressed row]` for unselected
   items (direction 5). Both are quiet and correct.
5. Per-operation impact lines and the destructive-action warnings.

## Fix these — round 1 got them wrong

1. **`14d → 0d` is illegal.** Log retention has `min: 1`. A decrease that hits the floor must
   render as `14d → 1d` with an explicit **clamped** marker, and if an item was already at the
   floor it becomes a no-op and must be counted as one. This is the most interesting numeric
   behaviour in the whole model and round 1 rendered it as a bug.
2. **Only destructive tag methods were shown.** Every tag operation across six directions was
   `replace all` or `clear`. The common cases are `add` and `remove`, and they behave differently:
   adding a tag an item already has is a no-op; removing a tag an item does not have is a no-op.
   Show `add` and `remove` as the default, `replace`/`clear` as the guarded exceptions.
3. **Half the directions never show what they are overwriting.** Directions 1, 3 and 5 jump
   straight to the new value. Mixed state must be visible *before* commit, in every direction:
   a blank field lies, and showing the first item's value lies louder.

## Cover these — nobody addressed them

4. **Partial failure.** 12 attempted, 9 succeeded, 3 failed. What does the table look like?
   Where do the failures go? How do you retry **only the failures** without re-running the nine
   that worked? This is the state that separates a real tool from a demo, and it is absent
   from all six directions.
5. **Scope honesty.** Every direction says "12 hosts selected". Real bulk edit breaks on
   "select all" — 12 on this page versus 1,847 matching the filter. Show the difference, make
   the larger scope a deliberate act, and never let the count be ambiguous.
6. **Keyboard operation.** No direction shows a focus state, a shortcut, or how this is driven
   without a mouse. Bulk edit is a power-user tool; someone doing this fifty times a day will
   never touch the trackpad. Show the focus ring, the tab order, and the commit shortcut.
7. **Undo.** After an irreversible-looking action lands, what is the recovery? Even "undo for
   30 seconds" is a design position. Silence is not.

## What to produce

**Converge on one direction: the inline command bar (1) fused with the distribution readout (2).**
Reason: direction 1 puts the diff in the real table so preview is not a separate screen, and
direction 2 is the only honest answer to what the current values are. Together they remove the
"build it blind, then preview it elsewhere" split that every other direction still carries.

Produce **one coherent flow**, not six variants:

1. **Resting** — selection made, nothing configured. Show the distribution of current values for
   the focused field.
2. **Configured, uncommitted** — field + method + value chosen, per-row diff live in the table,
   counts split into will-change and already-matches.
3. **A relative numeric operation** — decrease retention by 14 days, with at least one row
   clamping at the floor and being reported as a no-op.
4. **A destructive operation** — `clear` on tags, with whatever guard you think it earns.
5. **Committing** — the in-flight state.
6. **Partial failure** — 9 succeeded, 3 failed, with retry-just-the-failures.
7. **Scope escalation** — the moment "12 selected" becomes "all 1,847 matching".

## Craft bar

- **One visual language.** Round 1 shipped three dark frames and three light ones under two
  different product names ("Contra Console" and "Contra Infrastructure Ops"). Pick one and hold it.
- **Every frame fully populated.** Directions 4 and 5 rendered four rows of twelve and left half
  the canvas empty. Twelve rows means twelve rows.
- **Real data, consistent across frames.** The same twelve hosts with the same values in every
  frame, so the diffs are comparable.
- **Monospace for values, proportional for prose.** Round 1 mostly did this — keep it.
- Colour carries meaning only: one hue for change, one for destructive, one for no-op/unchanged.
  Never decoration.

## Anti-patterns — do not produce

- A toggle for a boolean field in bulk.
- A blank input implying "no current value" when the real state is mixed.
- A single "12 updated" confirmation.
- A preview that lives on a different screen from the thing being edited.
- Any count that does not distinguish will-change from already-matches.
