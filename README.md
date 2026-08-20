# bulk-edit-mixed

The state model behind a bulk-edit interface — for the case where the selected
items **don't currently agree with each other**.

Select twelve servers and change one setting. Some are production, some staging,
some development. What should the Environment field show?

Most products show a blank. A blank says *no value*, which is false. Some show
the first item's value, which is worse, because it looks like data. Either way
you can overwrite eleven things you never looked at.

**Write-up:** [omkarux.com/bulk-edit](https://omkarux.com/bulk-edit/)

---

## Why the model comes before the screens

A form cannot express this, because a form has one field and one value, and the
premise is that the values differ. Everything hard here is arithmetic rather than
layout, and arithmetic cannot be mocked — a drawing can show *an* answer without
being able to produce *the* answer.

That is not hypothetical. A wireframe for this interface was drawn with a
distribution reading `prod 100 · staging 60 · dev 40`, a summary reading
`195 will change · 5 already match`, and groups reading `staging→prod 120 ·
dev→prod 75`. Three numbers, no two of which can be true together. It looked
completely fine. The model makes that frame impossible to draw.

## What is here

```
src/model.js        the rules — pure functions, no interface
spec/fields.json    field type → legal operations
spec/model.test.js  25 tests, covering what products usually get wrong
demo/hosts.json     24 hosts, 17 distinct tag sets, deterministic
design/             the rubric, the scoring, and the working notes behind the direction
```

```bash
npm test
```

## The four ideas the model encodes

**1 · The legal operations are a function of field type.** Not a universal menu.

| Field type | Operations |
|---|---|
| single-select | `set` |
| multi-value | `add` `remove` `replace` `clear` |
| boolean | `enable` `disable` — never *toggle* |
| number | `set` `increaseBy` `decreaseBy` |

A toggle on mixed boolean state has no defined meaning. Half are on, half are
off — toggle them to what? Every product that ships one has quietly decided, and
none of them tell you which way.

**2 · There are three outcomes, not two.** An item can change, be deliberately
excluded, or already match. Excluded and already-matching must never share a
number: one is a decision the operator made, the other is work the system found
nothing to do. Collapsing them hides a decision.

**3 · Relative operations move each item from its own value, and clamp.**
"Decrease retention by 14 days" does something different to every item, and an
item already at the field minimum does not change at all. The operation succeeds
and does nothing, and the interface has to say so.

**4 · A per-row diff stops being reviewable long before a selection stops being
editable.** Six screens of scrolling is not verification. So `groupByTransition()`
collapses a plan into classes of change:

```
staging → prod    180 hosts
dev     → prod     15 hosts
already prod        5 hosts · no change
```

This holds at any size, because the number of distinct transitions is bounded by
the field's value space rather than by the selection. Relative numeric operations
are the exception — every item moves from its own value — so those group by
*outcome class* instead: moved, clamped at a limit, already there. Which is also
the only way clamping stays visible at scale rather than buried in row 147.

## Status

The model is built and tested. The interface is not. The direction is settled —
an inline command bar with a distribution readout, grouped diffs, and per-row
exclusion — chosen through a scored evaluation documented in `design/` and in the
write-up.

This is deliberately published before the interface exists, because the claim
being made is that the model *is* the design. That is either checkable or it is
just a sentence.

## Licence

MIT for code, CC BY 4.0 for the written material in `design/`.

Omkar Khadamkar · [omkarux.com](https://omkarux.com)
