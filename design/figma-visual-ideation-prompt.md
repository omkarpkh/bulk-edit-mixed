# Figma prompt — visual direction ideation

*Paste from the line below. Attach or link `visual-directions.html` if the agent can read it.*

---

I need visual direction ideation for a bulk-edit interface. The structure and the state model are already
settled and are **not** up for redesign — I am looking only for visual language.

## What the thing is

A bulk-edit control for infrastructure. The operator selects hosts, picks a field, picks a method, and sees
exactly what will happen **before** committing. Its entire reason for existing is that it does not lie about
what it is about to do.

Three facts the visual layer has to carry:

1. **Three outcome classes, never two** — *changing*, *excluded by the operator*, *already matching*.
   Excluded and already-matching must never share a number or a treatment. One is a decision the operator
   made; the other is work the system found nothing to do.
2. **At scale nobody reviews rows, they review classes of change.** A selection of 200 produces three
   transition groups, not 200 diffs. Group count is bounded by the field's value space, not the selection.
3. **Relative numeric operations can clamp.** Asking to decrease retention by 7 days on a host already at the
   1-day floor does not fail — it lands at 1 and stops. That is a third outcome, distinct from a clean
   decrease and from no change at all.

## The specimen — use these exact numbers in every direction

Operation: **Log retention → Decrease by → 7d**, across **200 selected hosts**.

Current distribution: `90d 53 · 7d 44 · 14d 38 · 30d 37 · 1d 28`
Tally: **172 will change · 28 already match**
Transition groups:
- `Decrease by 7d` — 128 will change
- `clamped at 1d` — 44 will change
- `already 1d` — 28 hosts, no change

**128 + 44 = 172, and 172 + 28 = 200. The arithmetic must close in every frame.** If a number in your design
does not reconcile, the design is wrong, not the number.

## Already explored — please go elsewhere

I have three directions drawn already, so these are taken:

1. **Instrument** — neutral chrome, one signal colour, monospaced tabular numerals, hairlines, no elevation.
2. **Restraint** — near-monochrome, one accent at five tints, 8–10px radii, one soft shadow, 200ms motion.
3. **Depth** — elevation as encoding, three levels, an off-ramp amber for *clamped*, 240ms with overshoot.

**Do not give me variations on those.** Territory I have not touched, as starting provocations rather than
instructions — find your own if you have better:

- A **dark operator console** — this is infrastructure tooling, and I have only drawn light.
- **Editorial / typographic** — type doing the work that colour and boxes usually do.
- **Dense grid** — treat it as a spreadsheet rather than a panel.
- **Diagrammatic** — draw the transitions as actual flow between states rather than listing them.
- **Deliberately unhurried** — this is a destructive, multiplied, irreversible action. A language that slows
  the operator down on purpose is a legitimate and under-explored answer.

## Motion — and the test it has to pass

There is a second state, and it is the whole reason motion matters here.

Change the operand from **7d** to **14d** and this happens:

| | tally | transition groups |
|---|---|---|
| Decrease by **7d** | 172 will change · 28 already match | 128 / 44 / 28 |
| Decrease by **14d** | **172 will change · 28 already match** | **90 / 82 / 28** |

**The headline is identical in both states.** Twice as many hosts get clamped, and the summary line does not
move at all. (These are real model outputs, not an illustration.)

So the motion has a job, not a mood: **it has to reveal a change the summary conceals.** If your transition
cross-fades or simply swaps values, the operator sees "172 · 28" both times and concludes nothing happened.

Two hard rules:

- **What did not change must not move.** The distribution bar is identical in both states — the *current*
  values did not change, only the proposed operation did. Animating it would assert a change that did not
  happen. Only the two group counts and the first group's label differ.
- **Motion is never load-bearing for correctness.** The numbers must be right even if the animation is
  dropped, throttled or the user has reduced-motion set. Design the transition as an enhancement to a
  state change that is already true.

**If you can prototype it**, wire the two states with Smart Animate and hand me the prototype link.
**If you cannot**, that is fine — give me the two frames per direction plus a precise spec I can build from:
duration in ms, easing curve, what property animates, what stays still, and what happens under
`prefers-reduced-motion`. Vague is useless; *"numbers count up over 150ms, linear, no other property moves"*
is buildable.

## What I want back

**Five distinct directions.** For each:

1. A one-word name and a one-sentence thesis.
2. The specimen above, rendered in that language, at real fidelity &mdash; **two frames: the 7d state and the
   14d state**, so the transition between them can be seen or built.
3. **A reason for every element choice — palette, type, spacing, motion, depth — in the form
   `choice → because`.** The *because* is the point. "It looks modern" is not a because. "The five values are
   ordinal so a single-hue ramp is more truthful than five hues" is a because.
4. **What it costs you.** Every direction trades something away. A direction with no stated cost has not been
   thought about, and I will score it lower, not higher.

## Two questions every direction must answer explicitly

- **Ordinal or categorical?** Retention values are *ordered* (1 < 7 < 14 < 30 < 90). Does your palette encode
  that order, or does it render an ordered scale as unrelated categories? Say which you chose and why.
- **Does the language distinguish "the system intervened"?** *Clamped* is not a smaller decrease — it is a
  different outcome. Does your visual language mark that, or flatten it into a normal transition? Either can
  be right. Say which you chose and why.

## Avoid — these all happened in the last round

- Different product names or visual identities across frames. One product, one identity.
- Half-empty canvases, or four rows standing in for 200.
- Inventing numbers, or changing my numbers to suit a layout.
- Redesigning the structure. Groups, tallies and the three outcome classes stay; only the language changes.

## Output

One Figma page. Five directions, each as a **pair** of same-size frames (7d state, 14d state), laid out so the
pairs can be compared across directions. A text block per direction carrying the thesis, the
`choice → because` list, the motion spec, and the cost. I am going to score these against a written
rubric, so the reasoning matters as much as the pixels.
