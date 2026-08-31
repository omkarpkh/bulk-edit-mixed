# Round 2 — visual direction scoring

*Eight directions. Three mine (Instrument, Restraint, Depth), five from a Figma agent
(Terminal, Ledger, Grid, Flow, Ceremony) at `node-id=0:2696`. Scored with
criteria-first-evaluation after `figma-round-findings.md`, which was the pre-scoring read.*

## Phase 1 — setup

**Evaluation mode: directions to develop.** → Because round 1 used the same rule
("0 = absent and the shape actively resists it · 1 = absent but the shape affords it"),
and these are visual languages to be built into a component, not finished screens.

**Contrast is a hard gate, not a weighted criterion.** → Because a direction whose stated
mechanism fails its own measurement is making a false claim, not an incomplete one. Grid's
amber row exists to make the row "glow"; at 1.04:1 it does not glow. That is not fixable
without abandoning the direction.

**The gate eliminated all eight.** Every direction fails AA on at least one of the two
load-bearing semantics. So the gate cannot select — it reframes:

> **Is the contrast failure in the palette, or in the mechanism?**

A palette failure is correctable without changing the direction. A mechanism failure is not.
Only Grid's is in the mechanism.

## Phase 2 — criteria and weights

| | Criterion | Rubric | Weight |
|---|---|---|---|
| C1 | Clamp is distinguishable from a clean change | 14/15 | **3×** |
| C2 | "Already matches" is legible, not decorative | 14/15 | **3×** |
| C3 | Ordinal encoding for an ordered scale | 11/15 | 2× |
| C4 | Double encoding — not colour alone | 12/15 | 2× |
| C5 | Density holds at 200 hosts inside the component | 10/15 | 2× |
| C6 | Fits the component's existing language | 7/15 | 1× |
| C7 | **Shows the state after execution, incl. partial failure** *(unmet by all)* | 12/15 | 2× |

C1 → Because a clamped decrease that looks like a clean decrease is the exact lie this piece exists to stop.
C7 → Because all eight are pre-flight previews. Partial failure was already on the round-1 build list and is still undrawn.

## Phase 3 — scores

| Direction | C1 ×3 | C2 ×3 | C3 ×2 | C4 ×2 | C5 ×2 | C6 ×1 | C7 ×2 | Weighted |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| **Flow** | 5 | 3 | 4 | 5 | 4 | 4 | 1 | **56/75 · 74.7%** |
| Ceremony | 4 | 3 | 4 | 4 | 2 | 3 | 1 | 46/75 · 61.3% |
| Grid | 2 | 3 | 4 | 3 | 5 | 4 | 1 | 45/75 · 60.0% |
| Depth | 4 | 2 | 4 | 3 | 3 | 3 | 1 | 43/75 · 57.3% |
| Terminal | 4 | 2 | 4 | 2 | 4 | 2 | 1 | 42/75 · 56.0% |
| Ledger | 4 | 1 | 4 | 4 | 3 | 3 | 1 | 42/75 · 56.0% |
| Restraint | 1 | 2 | 4 | 2 | 4 | 4 | 1 | 35/75 · 46.7% |
| Instrument | 1 | 3 | 1 | 1 | 4 | 4 | 1 | 30/75 · 40.0% |

**Stability: winner held across both passes.** Gap to second is 17.9% — clears the 10% gate.

## Winner — Flow, 74.7%

**→ Because it is the only direction where the clamp is depicted rather than labelled.** The arrow
grows or shrinks with magnitude and stops against a wall glyph; the "already matches" row has no
arrow at all. Colour *and* shape carry it, so it survives colour-blindness and a bad screen — the
only 5 on C4 in the set.

**Where it trails:** C2 at 3. Its "already match" grey is 2.45:1. Palette, not mechanism.

**Required correction before build:** clamped amber `#D97706` (3.04:1) and match grey `#94A3B8`
(2.45:1) must both reach AA. Neither touches the arrow-and-wall mechanism.

**Rubric influence:** unweighted, Grid ties Flow on raw total. Flow wins on weighting because C1
and C4 are where it is alone in the set, and those carry 5 of the 15 weight.

## Disclosure

**No option here was generated from the criteria.** All eight pre-date the rubric — mine from
27 Aug, the agent's from the same round. Unlike the portfolio-hero run, there is no fitting bias
to declare.

## What the losses cost me

**Instrument, last at 40.0%,** is mine. Five unrelated hues for an ordered scale scored 1 on C3,
and it renders a clamp identically to a clean decrease, scoring 1 on C1. Five independent
directions chose an ordinal ramp; the rubric agreed with them, not me.

**Restraint, seventh,** fails C1 for the same reason.

**Depth, fourth at 57.3%,** is the one of my three that marks the clamp — and it is the only one
of mine that beats a single agent direction.
