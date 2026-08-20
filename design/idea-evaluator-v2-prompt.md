# idea-evaluator — v2 changes

Paste into the skill's Figma agent thread. Five changes, ordered by how much
confidence each one buys.

---

## 1. Report variance. Do not report a single score.

**The problem:** the skill scores each idea once and reports a number. If the same
input would have produced 3/5 one time and 4/5 the next on a 3× criterion, the
winner could flip and nobody would know. A single-pass score presents a range as
a point.

**The change:** score every idea **twice, independently**, without the first pass
in context. Then report:

- the mean for each criterion
- **any criterion where the two passes differ**, called out by name
- a **stability line** in the Decision Summary: *"Winner held across both passes"*
  or *"Winner changed between passes — treat as a tie"*

If the winner is not the same in both passes, **do not declare a winner.** Present
the trade-off and ask.

**Why this is the highest-value change:** it is the standard the rest of my work is
held to. My published field tests run three isolated passes per condition and
publish the spread (93.1 / 91.4 / 89.7), because a result that cannot be
reproduced is not a result. The skill should meet the bar it is used to enforce.

---

## 2. Ask what kind of evaluation this is — in Phase 1

**The problem:** two rigorous evaluations of the same six bulk-edit directions
picked different winners. The criteria were not the cause. The cause was an
unasked question: one scored what the frames *demonstrate*, the other scored what
the shapes *afford*. Both are valid. They answer different questions.

**The change:** add a mandatory Phase 1 question, before criteria generation:

> **Are these candidates to judge as they are, or directions to develop further?**
>
> - **As they are** → score only what is visible in the design. An unbuilt
>   capability scores 0 regardless of intent.
> - **Directions to develop** → score what the structure can hold. Absent but
>   naturally accommodated scores 1; absent and structurally resisted scores 0.

State the chosen rule at the top of Phase 3, so every score is read against it.
Never infer this from context — the answer inverts results.

---

## 3. Generate criteria for what is missing from *every* option

**The problem:** criteria are currently derived from the brief and from
inspection, so the skill structurally cannot produce a criterion that **none** of
the options satisfies. That is exactly the criterion that exposes a shared blind
spot.

**The change:** after generating criteria from the brief, run a second pass asking
only: *what would a complete solution to this problem need that none of these
options has?* Add those as criteria even though everything will score 0 or 1, and
label them **Unmet by all options** in the results.

A criterion everything fails is not wasted — it is the most valuable output of the
evaluation. In the bulk-edit run, scoring the six directions on scope honesty,
partial failure, reversibility and keyboard operation showed all six shared the
same four gaps. That became the brief for the next round.

---

## 4. Enforce the close-call rule that already exists

**The problem:** the Decision Gap Protocol says a close call within 10% is a
**mandatory** ask — *"never declare a winner, present the trade-off and ask."* In
the bulk-edit run the gap was **2.7%** and a winner was declared anyway. The rule
is written and did not fire.

**The change:** make it a hard gate. Before writing a Winner line, compute the gap
between first and second. If it is under 10%, the Winner line is replaced by a
**Too close to call** block: the two leaders, the criteria that separate them, and
the question whose answer would break the tie. Confidence: Medium is not a
substitute for asking.

---

## 5. Watch the weight-tier spread

Across runs so far the tiers cluster: one evaluation put four of six criteria at
2× with nothing at 3×. If most criteria land in the same tier, weighting is
separating *matters* from *does not matter* rather than ranking what matters.

**The change:** report the tier distribution in the Decision Summary (e.g.
`3× ×1 · 2× ×4 · 1× ×1`). No rule change yet — collect it across the next few
runs, then decide whether the 13/9/5 band boundaries need widening.

---

## What not to change

The self-resolved-gap log, the "→ Because" line on every decision, and the
assumptions-requiring-validation block are the strongest parts of the output.
Keep them exactly as they are. The frequency-versus-severity reasoning in the
bulk-edit run — diff clarity is encountered on every edit, destructive methods
rarely — is the kind of judgment that makes the record worth reading.
