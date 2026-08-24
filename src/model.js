// Mixed — the state model for bulk editing values that differ.
//
// Everything hard about bulk edit lives here, not in the markup:
//   1. summarise()  — what a field looks like across a selection (uniform? mixed? which values?)
//   2. methodsFor() — which verbs are even legal for a field type
//   3. plan()       — what an operation WOULD do, per item, before anything is committed
//
// plan() is the important one. It is the difference between a product that says
// "40 items updated" and one that says "28 will change, 12 already match".

/* ---------------- summarising a field across a selection ---------------- */

const eqSet = (a, b) => a.length === b.length && a.every(v => b.includes(v));

/**
 * What does this field look like across these items?
 * Returns { uniform, value, values, counts, distinct }.
 * `values` is every distinct value present, so the UI can show them rather than
 * hiding behind the word "Mixed".
 */
export function summarise(items, field) {
  const raw = items.map(i => i[field.key]);

  if (field.type === 'multi-value') {
    const sets = raw.map(v => [...(v ?? [])].sort());
    const uniform = sets.every(s => eqSet(s, sets[0] ?? []));
    // for multi-value, per-value presence matters more than whole-set equality:
    // a tag can be on all, some, or none of the selection.
    const counts = new Map();
    for (const s of sets) for (const v of s) counts.set(v, (counts.get(v) ?? 0) + 1);
    const presence = [...counts.entries()]
      .map(([value, n]) => ({ value, count: n, state: n === items.length ? 'all' : 'some' }))
      .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)));
    return { uniform, value: uniform ? sets[0] ?? [] : null, presence, distinct: presence.length };
  }

  const counts = new Map();
  for (const v of raw) counts.set(v, (counts.get(v) ?? 0) + 1);
  const values = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
  return { uniform: values.length === 1, value: values.length === 1 ? values[0].value : null, values, distinct: values.length };
}

/* ---------------- which verbs are legal ---------------- */

const METHODS = {
  'single-select': ['set'],
  'multi-value': ['add', 'remove', 'replace', 'clear'],
  'boolean': ['enable', 'disable'],
  'number': ['set', 'increaseBy', 'decreaseBy'],
};

export const methodsFor = field => METHODS[field.type] ?? [];

export const METHOD_LABEL = {
  set: 'Set to', add: 'Add', remove: 'Remove', replace: 'Replace all with',
  clear: 'Clear all', enable: 'Enable', disable: 'Disable',
  increaseBy: 'Increase by', decreaseBy: 'Decrease by',
};

// Methods that can destroy data the user cannot see from the summary alone.
export const DESTRUCTIVE = new Set(['replace', 'clear']);

/* ---------------- what would happen ---------------- */

/** Apply an operation to a single value. Pure; no mutation. */
function applyTo(current, field, method, operand) {
  switch (field.type) {
    case 'single-select':
      return operand;

    case 'boolean':
      return method === 'enable';

    case 'number': {
      const n = Number(current ?? 0), k = Number(operand ?? 0);
      const next = method === 'set' ? k : method === 'increaseBy' ? n + k : n - k;
      const lo = field.min ?? -Infinity, hi = field.max ?? Infinity;
      return Math.min(hi, Math.max(lo, next));
    }

    case 'multi-value': {
      const cur = [...(current ?? [])];
      const ops = Array.isArray(operand) ? operand : operand == null ? [] : [operand];
      if (method === 'clear') return [];
      if (method === 'replace') return [...ops].sort();
      if (method === 'add') return [...new Set([...cur, ...ops])].sort();
      if (method === 'remove') return cur.filter(v => !ops.includes(v)).sort();
      return cur;
    }

    default:
      return current;
  }
}

const same = (a, b) =>
  Array.isArray(a) && Array.isArray(b) ? eqSet(a, b) : a === b;

/**
 * The heart of it. Given a selection and a proposed operation, return exactly
 * what would happen to each item — without touching anything.
 *
 * Every row carries `changes`, so the UI can be honest about no-ops instead of
 * reporting the size of the selection as the size of the change.
 */
export function plan(items, field, method, operand, excluded = []) {
  const skip = excluded instanceof Set ? excluded : new Set(excluded);

  const rows = items.map(item => {
    const before = item[field.key];
    const after = applyTo(before, field, method, operand);
    const wouldChange = !same(before, after);
    const isExcluded = skip.has(item.id);
    return {
      id: item.id, item, before, after,
      // `wouldChange` is what the operation does; `changes` is what will actually happen.
      // They differ only for excluded rows — which is the whole reason both exist.
      wouldChange,
      excluded: isExcluded,
      changes: wouldChange && !isExcluded,
      state: !wouldChange ? 'unchanged' : isExcluded ? 'excluded' : 'changing',
    };
  });

  const changing  = rows.filter(r => r.state === 'changing');
  const skipped   = rows.filter(r => r.state === 'excluded');
  const unchanged = rows.filter(r => r.state === 'unchanged');

  return {
    rows, changing, excluded: skipped, unchanged,
    counts: {
      total: rows.length,
      changing: changing.length,
      excluded: skipped.length,
      unchanged: unchanged.length,
    },
    destructive: DESTRUCTIVE.has(method) && changing.length > 0,
  };
}

/**
 * Collapse a plan into transition classes — "staging → prod: 180".
 *
 * This exists because a per-row diff stops being reviewable long before a
 * selection stops being editable. Six screens of scrolling is not verification.
 * The count of distinct transitions is bounded by the field's value space, not
 * by the size of the selection, so this holds at 12 rows and at 12,000.
 *
 * Relative numeric operations are the exception: every item moves from its own
 * value, so grouping by before→after would produce one group per item. Those
 * group by OUTCOME CLASS instead — moved, clamped at a limit, or already there —
 * which is also the only way clamping stays visible at scale.
 */
export function groupByTransition(planResult, field, method, operand) {
  const relative = field.type === 'number' && method !== 'set';
  // a bare number is ambiguous next to a count — "90 53" reads as one value
  const u = field.unit ? v => `${v}${field.unit}` : v => v;
  const lo = field.min ?? -Infinity, hi = field.max ?? Infinity;

  // Multi-value fields have the same unbounded-cardinality problem as relative
  // numbers: every item holds its own set, so before→after would produce one
  // group per item. They group by what the operation DID instead — bounded by
  // the size of the operand, not the size of the selection.
  const setwise = field.type === 'multi-value';
  const ops = Array.isArray(operand) ? operand : operand == null ? [] : [operand];

  const keyOf = row => {
    if (!row.wouldChange) {
      if (setwise) {
        const label = method === 'add'    ? `already has ${fmt(ops)}`
                    : method === 'remove' ? `does not have ${fmt(ops)}`
                    : method === 'clear'  ? 'already empty'
                    :                       'already matches';
        return { key: '__none__', label, kind: 'unchanged' };
      }
      return { key: '__none__', label: `already ${u(fmt(row.before))}`, kind: 'unchanged' };
    }

    if (relative) {
      const clamped = row.after === lo || row.after === hi;
      return clamped
        ? { key: '__clamped__', label: `clamped at ${u(fmt(row.after))}`, kind: 'clamped' }
        : { key: '__moved__', label: `${METHOD_LABEL[method]} ${u(fmt(Math.abs(row.after - row.before)))}`, kind: 'transition' };
    }

    if (setwise) {
      if (method === 'clear')   return { key: '__cleared__', label: 'cleared', kind: 'transition' };
      if (method === 'replace') return { key: '__replaced__', label: `replaced with ${fmt(ops)}`, kind: 'transition' };
      // which of the operand values actually moved for this item
      const before = new Set(row.before ?? []);
      const touched = method === 'add'
        ? ops.filter(v => !before.has(v))
        : ops.filter(v =>  before.has(v));
      const verb = method === 'add' ? 'gains' : 'loses';
      return { key: `${verb}:${touched.join('|')}`, label: `${verb} ${fmt(touched)}`, kind: 'transition' };
    }

    return { key: `${fmt(row.before)}→${fmt(row.after)}`, label: `${u(fmt(row.before))} → ${u(fmt(row.after))}`, kind: 'transition' };
  };

  const map = new Map();
  for (const row of planResult.rows) {
    const { key, label, kind } = keyOf(row);
    if (!map.has(key)) map.set(key, { key, label, kind, rows: [], changing: 0, excluded: 0 });
    const g = map.get(key);
    g.rows.push(row);
    if (row.state === 'changing') g.changing++;
    if (row.state === 'excluded') g.excluded++;
  }

  // transitions first, largest first; the no-op group always sits last and quiet
  return [...map.values()]
    .map(g => ({ ...g, total: g.rows.length }))
    .sort((a, b) =>
      (a.kind === 'unchanged') - (b.kind === 'unchanged') ||
      b.total - a.total ||
      a.label.localeCompare(b.label));
}

const fmt = v => Array.isArray(v) ? (v.length ? v.join(', ') : 'none')
               : typeof v === 'boolean' ? (v ? 'on' : 'off')
               : String(v);

/** Human summary of a plan. Deliberately refuses to round or flatter. */
export function describe(planResult) {
  const { total, changing, excluded, unchanged } = planResult.counts;
  const parts = [];

  if (total === 0) return 'Nothing selected';
  if (changing === 0 && excluded === 0) return `No change — all ${total} already match`;
  if (changing === 0) {
    const tail = unchanged ? ` · ${unchanged} already match` : '';
    return `Nothing will change — ${excluded} excluded${tail}`;
  }

  parts.push(`${changing} will change`);
  // Excluded and already-matching must never be reported as one number. One is a
  // decision the operator made; the other is work the system found nothing to do.
  if (excluded) parts.push(`${excluded} excluded`);
  if (unchanged) parts.push(`${unchanged} already match`);
  return parts.join(' · ');
}

/* ---------------- what actually happened ---------------- */

/**
 * A commit is the one place this model does not go: it is asynchronous, it has
 * side effects, and it belongs to whatever system owns the data. What the model
 * DOES own is the reporting — because "9 of 12 succeeded" is the last place a
 * bulk edit gets to lie, and it usually does.
 *
 * Give it the plan and the ids that failed. It returns what happened, without
 * ever conflating attempted with succeeded.
 */
export function reconcile(planResult, failedIds = []) {
  const failed = failedIds instanceof Set ? failedIds : new Set(failedIds);
  const attempted = planResult.changing;                    // excluded rows were never attempted
  const succeeded = attempted.filter(r => !failed.has(r.id));
  const errored   = attempted.filter(r =>  failed.has(r.id));

  return {
    attempted, succeeded, failed: errored,
    counts: {
      attempted: attempted.length,
      succeeded: succeeded.length,
      failed: errored.length,
      excluded: planResult.counts.excluded,
      unchanged: planResult.counts.unchanged,
    },
    complete: errored.length === 0,
  };
}

/**
 * The items a retry should target: the failures, and nothing else.
 *
 * Retrying the whole selection is the common implementation and it is wrong —
 * it re-applies work that already succeeded, and on a non-idempotent operation
 * that is a second edit, not a repeat of the first.
 */
export function retryScope(result) {
  return result.failed.map(r => r.item);
}

/** Human summary of a commit. Refuses to report attempted as succeeded. */
export function describeResult(result) {
  const { attempted, succeeded, failed, excluded } = result.counts;
  if (attempted === 0) return 'Nothing was applied';
  if (failed === 0) return `${succeeded} updated`;
  if (succeeded === 0) return `Nothing was applied — all ${failed} failed`;
  const tail = excluded ? ` · ${excluded} were excluded` : '';
  return `${succeeded} of ${attempted} updated · ${failed} failed${tail}`;
}

/* ---------------- several operations, committed together ---------------- */

/**
 * Run a list of operations over one item, in order, recording each step.
 * Operations only ever write their own field, so the record is threaded
 * through and each step sees whatever the steps before it left behind.
 */
function runPipeline(item, ops) {
  const rec = { ...item };
  const trail = ops.map(op => {
    const before = rec[op.field.key];
    const after = applyTo(before, op.field, op.method, op.operand);
    rec[op.field.key] = after;
    return { before, after, moved: !same(before, after) };
  });
  return { rec, trail };
}

const touchedKeys = ops => [...new Set(ops.map(op => op.field.key))];

const sameOn = (a, b, keys) => keys.every(k => same(a[k], b[k]));

/**
 * Several operations, previewed as one commit.
 *
 * plan() already answers "what does this operation do". The question that only
 * shows up with more than one is "which of these operations turns out to do
 * nothing" — and that is not a property of the operation list.
 *
 * `add tag pci` followed by `remove tag pci` is a dead first operation on a host
 * that already had the tag (the add was a no-op) and also a dead first operation
 * on one that did not (the remove undid it) — but for different reasons, and the
 * reasons are worth telling apart. Change the pair to `add pci` + `add monitored`
 * and both survive. Same shape of question, three different answers, decided by
 * the data rather than the operations.
 *
 * So the test is counterfactual: drop operation i, run the rest, and compare the
 * fields anything touched. If the outcome is identical, operation i did not
 * matter for this item. That is exact everywhere, including the case that trips
 * up an ordering rule — `+30` then `-30`, where the first operation IS
 * load-bearing (drop it and the result moves) even though the net is zero.
 *
 * Nothing here needs a conflict policy. There is no ordering to choose and
 * nothing to block. There is only a fact to report: this operation is dead, for
 * these items, for this reason.
 */
export function planBatch(items, ops, excluded = []) {
  const skip = excluded instanceof Set ? excluded : new Set(excluded);
  const keys = touchedKeys(ops);

  // For each operation, the pipeline with that operation removed — computed once,
  // not per item, because the operation list is the same for every item.
  const without = ops.map((_, i) => ops.filter((_, j) => j !== i));

  const rows = items.map(item => {
    const { rec, trail } = runPipeline(item, ops);

    const steps = trail.map((step, i) => {
      // Did dropping this operation change where the item ended up?
      const counterfactual = runPipeline(item, without[i]).rec;
      const matters = !sameOn(rec, counterfactual, keys);
      return {
        op: i,
        before: step.before,
        after: step.after,
        moved: step.moved,          // did it change the value at its own step
        matters,                    // did that change survive to the end
        // A step that never moved was already satisfied — the existing
        // "already matches" case, and not a conflict with anything.
        // A step that moved and then stopped mattering was overwritten.
        dead: !matters,
        reason: matters ? null : step.moved ? 'superseded' : 'already-matched',
      };
    });

    const isExcluded = skip.has(item.id);
    const wouldChange = !sameOn(item, rec, keys);

    return {
      id: item.id, item, after: rec, steps,
      wouldChange,
      excluded: isExcluded,
      changes: wouldChange && !isExcluded,
      state: !wouldChange ? 'unchanged' : isExcluded ? 'excluded' : 'changing',
    };
  });

  const changing  = rows.filter(r => r.state === 'changing');
  const skipped   = rows.filter(r => r.state === 'excluded');
  const unchanged = rows.filter(r => r.state === 'unchanged');

  // Per-operation rollup, counted over the items the commit will actually touch.
  // An operation dead on every one of them is dead work the operator built by
  // hand, and saying so is the entire point.
  const live = rows.filter(r => !r.excluded);
  const opReport = ops.map((op, i) => {
    const mine = live.map(r => r.steps[i]);
    const contributes = mine.filter(s => s.matters).length;
    const superseded  = mine.filter(s => s.reason === 'superseded').length;
    const matched     = mine.filter(s => s.reason === 'already-matched').length;
    const later = ops
      .map((o, j) => ({ o, j }))
      .filter(({ o, j }) => j > i && o.field.key === op.field.key)
      .map(({ j }) => j);
    return {
      index: i, ...op,
      contributes, superseded, alreadyMatched: matched,
      total: mine.length,
      dead: contributes === 0 && mine.length > 0,
      supersededBy: superseded > 0 ? later : [],
      destructive: DESTRUCTIVE.has(op.method),
    };
  });

  return {
    rows, ops: opReport, changing, excluded: skipped, unchanged,
    counts: {
      total: rows.length,
      changing: changing.length,
      excluded: skipped.length,
      unchanged: unchanged.length,
    },
    // Operations that do nothing at all. Not an error and not something to
    // block — the operator may be mid-edit. It is a fact the preview owes them.
    dead: opReport.filter(o => o.dead),
    destructive: opReport.some(o => o.destructive && o.contributes > 0),
  };
}
