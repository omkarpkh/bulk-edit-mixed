# Figma visual round — what came back

*Five directions, `node-id=108-2`. Read before scoring.*

---

## It followed the brief

| Check | Result |
|---|---|
| Arithmetic closes in every frame | **10 of 10.** 128+44=172 · 90+82=172 · +28=200, verified in the node metadata |
| Two frames per direction (7d / 14d) | 5 of 5 |
| `choice → because` per element | 5 of 5, roughly 13–18 elements each |
| A stated cost | 5 of 5, and several are brutal about themselves |
| Ordinal-or-categorical answered | 5 of 5 |
| Clamped-distinction answered | 5 of 5 |

Round one's Treatment C was out by 9 hosts. Nothing here is.

---

## ⚠️ Two findings that go against my own directions

**All five chose an ordinal ramp.** Every one. Which means my **Instrument** — five unrelated hues for an
ordered scale — was the outlier, and it was wrong. I had already flagged it as breaking its own
"colour only encodes" rule; five independent directions agreeing is confirmation, not opinion.

**All five distinguish "the system intervened."** Terminal shifts hue to amber, Ledger to correction-ink red,
Grid tints the whole row, Flow uses amber *plus a different glyph*, Ceremony uses a warm orange that says
*"important, not danger — the system helped, it didn't fail."*

**I managed that in one of my three.** Instrument and Restraint both render a clamp identically to a clean
decrease. The agent got it right five times out of five.

---

## Where it broke the rules

**Ledger and Ceremony both animate the distribution bar.**

> Ledger — *"Numbers cross-fade; bar segments slide."*
> Ceremony — *"Bar slides with perceptible deceleration."*

The bar is byte-identical between the two states — I checked the rectangle widths in the metadata
(102 / 84 / 73 / 71 / 54 in both Ledger frames). The *current* distribution does not change; only the
proposed operation does. Animating it asserts a change that did not happen, which the brief called out as a
hard rule.

Both also **cross-fade the numbers**, which the brief named as the failure mode: a cross-fade does not show
direction, so 128→90 and 128→180 look the same.

---

## Best answers in the set

**Motion — Flow.** *"Arrows grow/shrink for changed magnitude. Wall glyph holds. Dashed line holds. Only
arrow length and count digits animate."* The only direction where **motion carries information** rather than
decorating a value change: arrow length encodes magnitude, so the clamped group visibly swells as it doubles.
It also obeys the what-didn't-change-must-not-move rule explicitly.

**Single idea — Flow's arrow hitting a wall.** *"The wall makes the constraint visible — would move but
cannot."* It does not label the clamp, it depicts it, and it is **doubly encoded** (colour *and* shape), so it
survives colour-blindness and a bad screen.

**Most honest cost — Grid.** *"Grid metaphor lies about granularity — 3 groups, not 200 rows."* A direction
identifying its own dishonesty is worth more than one claiming none.

**Best reframe — Ceremony on colour.** Deep orange for clamped because *"'important' not 'danger' — the
system helped, it didn't fail."* Red would have been the lazy choice.

---

## ⚠️ The gap: nobody gave contrast ratios

The brief asked explicitly — *"give me the actual numbers, not a claim that it is accessible."* All five gave
hex values and no ratios. Computed here:

| Direction | Pair | Ratio | |
|---|---|---|---|
| Terminal | "already match" grey `#6B7280` on `#0C1017` | **3.94** | fails AA text |
| Ledger | "already match" grey `#D6D3D1` on cream | **1.47** | effectively invisible |
| Flow | **clamped amber `#D97706`** on `#F8FAFC` | **3.04** | fails AA text |
| Flow | "already match" grey `#94A3B8` | **2.45** | fails AA text |
| Grid | **clamped amber cell `#FFFBEB`** vs white | **1.04** | the row does not "glow" |
| Ceremony | labels + "already match" `#A8A29E` on white | **2.52** | fails AA text |

Passing: Terminal's pill text (15.46) and amber (8.87), Ledger's red (6.36), Ceremony's orange (5.18).

**The failures cluster on exactly the two semantics the brief said matter most** — the clamped signal and the
already-match count. Grid's amber row is the clearest case: its stated purpose is *"entire row glows to flag
intervention,"* and at 1.04:1 it does not glow at all.

Low-contrast *borders* are listed for completeness but are not counted as failures — a pill border beside
legible text is decorative, not the sole carrier of meaning.

**This is not a Figma-agent failing.** My own three had the same problem: Restraint's palest tints and Depth's
amber badge both fail. Contrast is where visual directions go wrong by default, which is the argument for
putting it in the rubric rather than in a review.
