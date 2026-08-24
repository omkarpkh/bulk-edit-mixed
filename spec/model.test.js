// Correctness tests for the bulk-edit model.
// These encode the cases products usually get wrong. If one of these breaks,
// the UI on top is lying to someone.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarise, methodsFor, plan, planBatch, describeBatch, phraseOp, describe, groupByTransition, reconcile, retryScope, describeResult, DESTRUCTIVE } from '../src/model.js';

const F = {
  env:  { key: 'environment',   label: 'Environment',   type: 'single-select', options: ['Production', 'Staging'] },
  tags: { key: 'tags',          label: 'Tags',          type: 'multi-value' },
  mon:  { key: 'monitoring',    label: 'Monitoring',    type: 'boolean' },
  ret:  { key: 'retentionDays', label: 'Log retention', type: 'number', min: 1, max: 365, unit: 'd' },
};

const mk = (...vals) => vals.map((v, i) => ({ id: `i${i}`, ...v }));

/* ---------------- summarise ---------------- */

test('uniform single-select reports the value', () => {
  const s = summarise(mk({ environment: 'Production' }, { environment: 'Production' }), F.env);
  assert.equal(s.uniform, true);
  assert.equal(s.value, 'Production');
  assert.equal(s.distinct, 1);
});

test('mixed single-select refuses to pick a winner and reports every value', () => {
  const s = summarise(mk({ environment: 'Production' }, { environment: 'Staging' }, { environment: 'Staging' }), F.env);
  assert.equal(s.uniform, false);
  assert.equal(s.value, null, 'must not present one value as if it were the value');
  assert.equal(s.distinct, 2);
  assert.deepEqual(s.values.map(v => v.value), ['Staging', 'Production'], 'ordered by frequency');
  assert.deepEqual(s.values.map(v => v.count), [2, 1]);
});

test('multi-value reports per-value presence, not just set equality', () => {
  const s = summarise(mk({ tags: ['pci', 'db'] }, { tags: ['pci'] }, { tags: [] }), F.tags);
  assert.equal(s.uniform, false);
  const pci = s.presence.find(p => p.value === 'pci');
  assert.equal(pci.count, 2);
  assert.equal(pci.state, 'some', 'on 2 of 3 — must not read as "all"');
});

test('a tag on every item reads as all', () => {
  const s = summarise(mk({ tags: ['pci'] }, { tags: ['pci', 'db'] }), F.tags);
  assert.equal(s.presence.find(p => p.value === 'pci').state, 'all');
  assert.equal(s.presence.find(p => p.value === 'db').state, 'some');
});

/* ---------------- legal methods ---------------- */

test('the verb set is a function of field type', () => {
  assert.deepEqual(methodsFor(F.env), ['set']);
  assert.deepEqual(methodsFor(F.tags), ['add', 'remove', 'replace', 'clear']);
  assert.deepEqual(methodsFor(F.mon), ['enable', 'disable']);
  assert.deepEqual(methodsFor(F.ret), ['set', 'increaseBy', 'decreaseBy']);
});

test('boolean never offers a toggle — it has no meaning on mixed state', () => {
  assert.ok(!methodsFor(F.mon).includes('toggle'));
});

/* ---------------- the no-op honesty case ---------------- */

test('adding a tag some items already have counts only the ones that change', () => {
  const items = mk({ tags: ['pci'] }, { tags: ['pci'] }, { tags: [] }, { tags: ['db'] });
  const p = plan(items, F.tags, 'add', ['pci']);
  assert.equal(p.counts.total, 4);
  assert.equal(p.counts.changing, 2, 'two already have pci and must not be counted');
  assert.equal(p.counts.unchanged, 2);
  assert.equal(describe(p), '2 will change · 2 already match');
});

test('an operation that changes nothing says so plainly', () => {
  const p = plan(mk({ tags: ['pci'] }, { tags: ['pci'] }), F.tags, 'add', ['pci']);
  assert.equal(p.counts.changing, 0);
  assert.equal(describe(p), 'No change — all 2 already match');
});

test('setting a single-select to the value some already hold', () => {
  const p = plan(mk({ environment: 'Production' }, { environment: 'Staging' }), F.env, 'set', 'Production');
  assert.equal(p.counts.changing, 1);
});

/* ---------------- multi-value semantics ---------------- */

test('remove only affects items that carry the tag', () => {
  const p = plan(mk({ tags: ['pci', 'db'] }, { tags: ['db'] }), F.tags, 'remove', ['pci']);
  assert.equal(p.counts.changing, 1);
  assert.deepEqual(p.rows[0].after, ['db']);
  assert.deepEqual(p.rows[1].after, ['db']);
});

test('replace is destructive and is flagged as such', () => {
  const p = plan(mk({ tags: ['pci', 'db'] }), F.tags, 'replace', ['gpu']);
  assert.deepEqual(p.rows[0].after, ['gpu']);
  assert.equal(p.destructive, true);
  assert.ok(DESTRUCTIVE.has('replace') && DESTRUCTIVE.has('clear'));
});

test('clear empties, and is a no-op on already-empty items', () => {
  const p = plan(mk({ tags: ['pci'] }, { tags: [] }), F.tags, 'clear', null);
  assert.equal(p.counts.changing, 1);
  assert.equal(p.destructive, true);
});

test('add does not duplicate and keeps a stable order', () => {
  const p = plan(mk({ tags: ['db', 'pci'] }), F.tags, 'add', ['pci', 'gpu']);
  assert.deepEqual(p.rows[0].after, ['db', 'gpu', 'pci']);
});

/* ---------------- numbers ---------------- */

test('relative numeric methods are why bulk edit is not a form', () => {
  const p = plan(mk({ retentionDays: 30 }, { retentionDays: 90 }), F.ret, 'increaseBy', 30);
  assert.equal(p.rows[0].after, 60);
  assert.equal(p.rows[1].after, 120, 'each item moves from its own value, not a shared one');
});

test('numeric results clamp to the field range', () => {
  const p = plan(mk({ retentionDays: 350 }, { retentionDays: 5 }), F.ret, 'increaseBy', 100);
  assert.equal(p.rows[0].after, 365, 'clamped at max');
  const q = plan(mk({ retentionDays: 5 }), F.ret, 'decreaseBy', 100);
  assert.equal(q.rows[0].after, 1, 'clamped at min');
});

test('clamping can silently make an operation a no-op, and that is reported', () => {
  const p = plan(mk({ retentionDays: 365 }), F.ret, 'increaseBy', 30);
  assert.equal(p.counts.changing, 0, 'already at max — nothing happens and the UI must say so');
});

/* ---------------- booleans ---------------- */

test('enable only changes the items that were off', () => {
  const p = plan(mk({ monitoring: true }, { monitoring: false }), F.mon, 'enable', null);
  assert.equal(p.counts.changing, 1);
  assert.equal(p.rows[0].after, true);
  assert.equal(p.rows[1].after, true);
});

/* ---------------- purity ---------------- */

test('planning never mutates the items it is planning over', () => {
  const items = mk({ tags: ['pci'] }, { retentionDays: 30 });
  const snapshot = JSON.stringify(items);
  plan(items, F.tags, 'replace', ['gpu']);
  plan(items, F.ret, 'increaseBy', 10);
  assert.equal(JSON.stringify(items), snapshot, 'preview must be free of side effects');
});

/* ---------------- exclusion, three-way counts, transition grouping ---------------- */

test('excluded rows keep their computed diff so the UI can grey it, not hide it', () => {
  const hosts = [
    { id: 'a', environment: 'staging' },
    { id: 'b', environment: 'staging' },
    { id: 'c', environment: 'prod' },
  ];
  const p = plan(hosts, F.env, 'set', 'prod', ['a']);
  const a = p.rows.find(r => r.id === 'a');

  assert.equal(a.excluded, true);
  assert.equal(a.wouldChange, true, 'the operation still applies to it');
  assert.equal(a.changes, false, 'but it will not actually happen');
  assert.equal(a.after, 'prod', 'and the diff survives, so it can be rendered greyed');
  assert.equal(a.state, 'excluded');
});

test('excluded and already-matching are never counted together', () => {
  const hosts = [
    { id: 'a', environment: 'staging' },   // excluded
    { id: 'b', environment: 'staging' },   // will change
    { id: 'c', environment: 'prod' },      // already matches
  ];
  const p = plan(hosts, F.env, 'set', 'prod', ['a']);

  assert.deepEqual(p.counts, { total: 3, changing: 1, excluded: 1, unchanged: 1 });
  assert.equal(describe(p), '1 will change · 1 excluded · 1 already match');

  // the failure this test exists to prevent
  assert.notEqual(p.counts.excluded + p.counts.unchanged, p.counts.unchanged,
    'collapsing the two would report 2 already-matching and hide a decision');
});

test('counts always reconcile to the selection size', () => {
  const hosts = Array.from({ length: 200 }, (_, i) => ({
    id: `h${i}`,
    environment: i < 120 ? 'staging' : i < 195 ? 'dev' : 'prod',
  }));
  const p = plan(hosts, F.env, 'set', 'prod', ['h0', 'h1', 'h2']);
  const { total, changing, excluded, unchanged } = p.counts;

  assert.equal(changing + excluded + unchanged, total, 'this is the arithmetic a hand-drawn wireframe got wrong');
  assert.deepEqual({ changing, excluded, unchanged }, { changing: 192, excluded: 3, unchanged: 5 });
});

test('grouping collapses a large selection to a handful of transitions', () => {
  const hosts = Array.from({ length: 200 }, (_, i) => ({
    id: `h${i}`,
    environment: i < 120 ? 'staging' : i < 195 ? 'dev' : 'prod',
  }));
  const p = plan(hosts, F.env, 'set', 'prod', ['h0', 'h1', 'h2']);
  const groups = groupByTransition(p, F.env, 'set', 'prod');

  assert.equal(groups.length, 3, 'bounded by the field value space, not the selection size');
  assert.deepEqual(groups.map(g => [g.label, g.total, g.changing, g.excluded]), [
    ['staging → prod', 120, 117, 3],
    ['dev → prod', 75, 75, 0],
    ['already prod', 5, 0, 0],
  ]);
  assert.equal(groups.at(-1).kind, 'unchanged', 'the no-op group sorts last so it can be rendered quiet');
});

test('group counts sum to the plan counts — the wireframe bug, caught', () => {
  const hosts = Array.from({ length: 200 }, (_, i) => ({
    id: `h${i}`,
    environment: i < 120 ? 'staging' : i < 195 ? 'dev' : 'prod',
  }));
  const p = plan(hosts, F.env, 'set', 'prod', ['h0', 'h1', 'h2']);
  const groups = groupByTransition(p, F.env, 'set', 'prod');

  const sum = k => groups.reduce((n, g) => n + g[k], 0);
  assert.equal(sum('total'), p.counts.total);
  assert.equal(sum('changing'), p.counts.changing);
  assert.equal(sum('excluded'), p.counts.excluded);
});

test('relative numeric ops group by outcome class, not by value', () => {
  const hosts = [
    { id: 'a', retentionDays: 30 },   // 30 -> 16
    { id: 'b', retentionDays: 90 },   // 90 -> 76
    { id: 'c', retentionDays: 7 },    // clamps at 1
    { id: 'd', retentionDays: 1 },    // already at floor, no change
  ];
  const p = plan(hosts, F.ret, 'decreaseBy', 14);
  const groups = groupByTransition(p, F.ret, 'decreaseBy', 14);

  // grouping by before→after would give four groups for four hosts — useless at scale
  assert.equal(groups.length, 3);
  assert.deepEqual(groups.map(g => [g.kind, g.total]), [
    ['transition', 2],
    ['clamped', 1],
    ['unchanged', 1],
  ]);
  assert.equal(p.rows.find(r => r.id === 'c').after, 1, 'clamped to the field minimum');
  assert.equal(p.rows.find(r => r.id === 'd').changes, false, 'clamping can make an op a silent no-op');
});

test('an empty exclusion set behaves exactly as before', () => {
  const hosts = [{ id: 'a', environment: 'staging' }, { id: 'b', environment: 'prod' }];
  const withArg = plan(hosts, F.env, 'set', 'prod', []);
  const without = plan(hosts, F.env, 'set', 'prod');
  assert.deepEqual(withArg.counts, without.counts);
  assert.equal(describe(without), '1 will change · 1 already match');
});

/* ---------------- edges the first pass missed ---------------- */

test('multi-value grouping is bounded by the operand, not the selection', () => {
  // every item holds its own set, so before→after would give one group per item —
  // the exact failure grouping exists to prevent
  const items = mk({ tags: ['pci', 'db'] }, { tags: ['db'] }, { tags: [] }, { tags: ['pci', 'db', 'gpu'] });
  const p = plan(items, F.tags, 'add', ['gpu']);
  const groups = groupByTransition(p, F.tags, 'add', ['gpu']);

  assert.equal(groups.length, 2, 'gains it, or already has it');
  assert.deepEqual(groups.map(g => [g.label, g.total]), [
    ['gains gpu', 3],
    ['already has gpu', 1],
  ]);
});

test('remove and clear group by what the operation did', () => {
  const items = mk({ tags: ['pci', 'db'] }, { tags: ['db'] }, { tags: [] });
  const rm = groupByTransition(plan(items, F.tags, 'remove', ['db']), F.tags, 'remove', ['db']);
  assert.deepEqual(rm.map(g => [g.label, g.total]), [['loses db', 2], ['does not have db', 1]]);

  const cl = groupByTransition(plan(items, F.tags, 'clear', null), F.tags, 'clear', null);
  assert.deepEqual(cl.map(g => [g.label, g.total]), [['cleared', 2], ['already empty', 1]]);
});

test('an empty selection says so instead of claiming everything matches', () => {
  const p = plan([], F.ret, 'increaseBy', 10);
  assert.deepEqual(p.counts, { total: 0, changing: 0, excluded: 0, unchanged: 0 });
  assert.equal(describe(p), 'Nothing selected');
});

test('excluding everything reads as a decision, not as a no-op', () => {
  const p = plan(mk({ tags: [] }, { tags: [] }), F.tags, 'add', ['pci'], ['i0', 'i1']);
  assert.equal(p.counts.changing, 0);
  assert.equal(p.counts.excluded, 2);
  assert.equal(describe(p), 'Nothing will change — 2 excluded',
    'must not read as "0 will change", and must never say everything already matches');
});

test('summarise works on booleans without special-casing at the call site', () => {
  const s = summarise(mk({ monitoring: true }, { monitoring: false }, { monitoring: true }), F.mon);
  assert.equal(s.uniform, false);
  assert.equal(s.value, null);
  assert.deepEqual(s.values.map(v => [v.value, v.count]), [[true, 2], [false, 1]]);
});

test('boolean groups read as on and off, not true and false', () => {
  const items = mk({ monitoring: false }, { monitoring: false }, { monitoring: true });
  const p = plan(items, F.mon, 'enable', null);
  const groups = groupByTransition(p, F.mon, 'enable', null);
  assert.deepEqual(groups.map(g => g.label), ['off → on', 'already on']);
});

/* ---------------- committing, and the last place it can lie ---------------- */

test('a partial failure never reports attempted as succeeded', () => {
  const items = mk({ environment: 'staging' }, { environment: 'staging' }, { environment: 'staging' }, { environment: 'prod' });
  const p = plan(items, F.env, 'set', 'prod');
  const r = reconcile(p, ['i1']);

  assert.deepEqual(r.counts, { attempted: 3, succeeded: 2, failed: 1, excluded: 0, unchanged: 1 });
  assert.equal(describeResult(r), '2 of 3 updated · 1 failed');
  assert.equal(r.complete, false);
});

test('excluded items are never attempted, so they can never fail', () => {
  const items = mk({ environment: 'staging' }, { environment: 'staging' }, { environment: 'prod' });
  const p = plan(items, F.env, 'set', 'prod', ['i0']);
  const r = reconcile(p, []);

  assert.equal(r.counts.attempted, 1, 'the excluded host was never in scope');
  assert.equal(describeResult(r), '1 updated');
  assert.ok(!r.attempted.some(x => x.id === 'i0'));
});

test('a retry targets the failures and nothing else', () => {
  const items = mk({ environment: 'staging' }, { environment: 'staging' }, { environment: 'staging' });
  const p = plan(items, F.env, 'set', 'prod');
  const r = reconcile(p, ['i0', 'i2']);
  const again = retryScope(r);

  assert.deepEqual(again.map(i => i.id), ['i0', 'i2']);
  assert.ok(!again.some(i => i.id === 'i1'),
    're-running a success is a second edit, not a repeat of the first');
});

test('total failure reads differently from nothing to do', () => {
  const items = mk({ environment: 'staging' }, { environment: 'staging' });
  const allFailed = reconcile(plan(items, F.env, 'set', 'prod'), ['i0', 'i1']);
  const nothingToDo = reconcile(plan(mk({ environment: 'prod' }), F.env, 'set', 'prod'), []);

  assert.equal(describeResult(allFailed), 'Nothing was applied — all 2 failed');
  assert.equal(describeResult(nothingToDo), 'Nothing was applied');
});

test('a retry of a retry converges', () => {
  const items = mk({ environment: 'staging' }, { environment: 'staging' }, { environment: 'staging' });
  const first = reconcile(plan(items, F.env, 'set', 'prod'), ['i0', 'i2']);

  const second = reconcile(plan(retryScope(first), F.env, 'set', 'prod'), ['i2']);
  assert.equal(second.counts.attempted, 2);
  assert.equal(describeResult(second), '1 of 2 updated · 1 failed');

  const third = reconcile(plan(retryScope(second), F.env, 'set', 'prod'), []);
  assert.equal(describeResult(third), '1 updated');
  assert.equal(third.complete, true);
});

/* ---------------- planBatch — several operations, one commit ---------------- */
//
// These are the cases that decide whether "what happens when two operations
// touch the same field" needs a policy. It does not. It needs the plan.

const op = (field, method, operand) => ({ field, method, operand });

test('operations on different fields all survive the reduction', () => {
  const b = planBatch(mk({ environment: 'Staging', retentionDays: 30 }),
    [op(F.env, 'set', 'Production'), op(F.ret, 'increaseBy', 30)]);
  assert.equal(b.dead.length, 0);
  assert.equal(b.reduced.length, 2);
  assert.equal(b.rows[0].after.environment, 'Production');
  assert.equal(b.rows[0].after.retentionDays, 60);
});

test('two absolute writes to one field — the first drops out, and says why', () => {
  const b = planBatch(mk({ environment: 'Development' }),
    [op(F.env, 'set', 'Production'), op(F.env, 'set', 'Staging')]);
  assert.equal(b.ops[0].dead, true);
  assert.equal(b.ops[0].superseded, 1);
  assert.deepEqual(b.ops[0].supersededBy, [1]);
  assert.equal(b.ops[1].dead, false);
  assert.equal(b.rows[0].after.environment, 'Staging');
});

test('add then clear — the add drops out', () => {
  const b = planBatch(mk({ tags: ['web'] }),
    [op(F.tags, 'add', 'pci'), op(F.tags, 'clear', null)]);
  assert.equal(b.ops[0].dead, true);
  assert.equal(b.ops[0].superseded, 1);
  assert.deepEqual(b.rows[0].after.tags, []);
});

// The case no static policy can classify: one pair of operations, two hosts,
// the same operation doing nothing on both — for two different reasons.
test('add then remove does nothing on every host, but not for the same reason', () => {
  const b = planBatch(mk({ tags: ['pci'] }, { tags: [] }),
    [op(F.tags, 'add', 'pci'), op(F.tags, 'remove', 'pci')]);

  assert.equal(b.ops[0].dead, true, 'the add never survives');
  assert.equal(b.ops[0].alreadyMatched, 1, 'host that already had the tag');
  assert.equal(b.ops[0].superseded, 1, 'host where the remove undid it');
  assert.equal(b.rows[0].steps[0].moved, false);
  assert.equal(b.rows[1].steps[0].moved, true);

  // and what is left is a batch the operator would recognise
  assert.deepEqual(b.reduced.map(o => o.index), [1]);
  assert.equal(describeBatch(b).equivalent, 'Remove pci from Tags');
});

test('the same pair with different operands composes and nothing drops out', () => {
  const b = planBatch(mk({ tags: [] }),
    [op(F.tags, 'add', 'pci'), op(F.tags, 'add', 'monitored')]);
  assert.equal(b.dead.length, 0);
  assert.deepEqual(b.rows[0].after.tags, ['monitored', 'pci']);
});

// An ordering rule reads "+30 then -30" as the second overwriting the first.
// It does not. Drop either one and the answer moves, so both are load-bearing —
// even though the item ends up exactly where it started.
test('increase then decrease — net zero, but both operations are load-bearing', () => {
  const b = planBatch(mk({ retentionDays: 60 }),
    [op(F.ret, 'increaseBy', 30), op(F.ret, 'decreaseBy', 30)]);
  assert.equal(b.dead.length, 0);
  assert.equal(b.rows[0].after.retentionDays, 60);
  assert.equal(b.rows[0].state, 'unchanged', 'the batch is a no-op and says so');
  assert.equal(b.counts.changing, 0);
});

test('relative operations compose', () => {
  const b = planBatch(mk({ retentionDays: 60 }),
    [op(F.ret, 'increaseBy', 30), op(F.ret, 'increaseBy', 10)]);
  assert.equal(b.rows[0].after.retentionDays, 100);
  assert.equal(b.dead.length, 0);
});

// Two operations that are each removable ALONE but not together. Testing them
// independently calls both redundant and reduces a working batch to nothing;
// dropping as you go keeps exactly one, and keeps the later one.
test('mutually redundant operations do not both drop out', () => {
  const b = planBatch(mk({ retentionDays: 60 }),
    [op(F.ret, 'increaseBy', 30), op(F.ret, 'set', 90)]);
  assert.equal(b.rows[0].after.retentionDays, 90);
  assert.equal(b.reduced.length, 1, 'the batch still does something');
  assert.deepEqual(b.reduced.map(o => o.index), [1], 'and it is the one written last');
  assert.equal(describeBatch(b).equivalent, 'Set Log retention to 90d');
});

test('the same operation written twice keeps one of them', () => {
  const b = planBatch(mk({ tags: [] }),
    [op(F.tags, 'add', 'pci'), op(F.tags, 'add', 'pci')]);
  assert.deepEqual(b.rows[0].after.tags, ['pci']);
  assert.deepEqual(b.reduced.map(o => o.index), [1]);
});

test('absolute then relative keeps both', () => {
  const b = planBatch(mk({ retentionDays: 60 }),
    [op(F.ret, 'set', 90), op(F.ret, 'increaseBy', 30)]);
  assert.equal(b.dead.length, 0);
  assert.equal(b.rows[0].after.retentionDays, 120);
});

test('an excluded item cannot make an operation necessary', () => {
  const items = mk({ environment: 'Staging' }, { environment: 'Staging' });
  const b = planBatch(items, [op(F.env, 'set', 'Production')], [items[1].id]);
  assert.equal(b.counts.changing, 1);
  assert.equal(b.counts.excluded, 1);
  assert.equal(b.ops[0].total, 1, 'rolled up over what will actually be committed');
  assert.equal(b.ops[0].dead, false);
});

test('a destructive operation that drops out is not reported as destructive', () => {
  const b = planBatch(mk({ tags: ['web'] }),
    [op(F.tags, 'clear', null), op(F.tags, 'replace', ['pci'])]);
  assert.equal(b.ops[0].dead, true, 'the clear is erased by the replace');
  assert.equal(b.destructive, true, 'because the replace still destroys');

  const harmless = planBatch(mk({ tags: [] }), [op(F.tags, 'clear', null)]);
  assert.equal(harmless.destructive, false, 'nothing to destroy');
});

test('batch state agrees with counts and never double-counts a row', () => {
  const items = mk({ environment: 'Staging' }, { environment: 'Production' }, { environment: 'Staging' });
  const b = planBatch(items, [op(F.env, 'set', 'Production')], [items[2].id]);
  const { total, changing, excluded, unchanged } = b.counts;
  assert.equal(changing + excluded + unchanged, total);
  assert.equal(changing, 1);
  assert.equal(unchanged, 1);
  assert.equal(excluded, 1);
});

/* ---------------- describeBatch — what the operator is told ---------------- */

test('a batch with nothing to drop is not reducible', () => {
  const b = planBatch(mk({ tags: [] }), [op(F.tags, 'add', 'pci'), op(F.tags, 'add', 'monitored')]);
  const d = describeBatch(b);
  assert.equal(d.reducible, false);
  assert.equal(d.equivalent, null);
});

test('the explanation names the later operation rather than blaming the earlier one', () => {
  const b = planBatch(mk({ environment: 'Development' }),
    [op(F.env, 'set', 'Production'), op(F.env, 'set', 'Staging')]);
  const d = describeBatch(b);
  assert.equal(d.equivalent, 'Set Environment to Staging');
  assert.match(d.notes[0].text, /Set Environment to Staging undoes it/);
  assert.doesNotMatch(d.notes[0].text, /conflict|error|invalid/i);
});

test('a mixed batch reports both reasons with their own numbers', () => {
  const items = [
    ...Array.from({ length: 3 }, (_, i) => ({ id: `has${i}`, tags: ['pci'] })),
    ...Array.from({ length: 2 }, (_, i) => ({ id: `not${i}`, tags: [] })),
  ];
  const d = describeBatch(planBatch(items, [op(F.tags, 'add', 'pci'), op(F.tags, 'remove', 'pci')]));
  assert.equal(d.equivalent, 'Remove pci from Tags');
  assert.match(d.notes[0].text, /3 already match/);
  assert.match(d.notes[0].text, /undoes it on the other 2/);
});

test('a batch that changes nothing says so instead of offering a shorter form', () => {
  const b = planBatch(mk({ environment: 'Production' }), [op(F.env, 'set', 'Production')]);
  assert.equal(b.counts.changing, 0);
  assert.equal(describeBatch(b).reducible, false);
});
