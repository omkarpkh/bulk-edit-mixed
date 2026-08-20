// Correctness tests for the bulk-edit model.
// These encode the cases products usually get wrong. If one of these breaks,
// the UI on top is lying to someone.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarise, methodsFor, plan, describe, groupByTransition, DESTRUCTIVE } from '../src/model.js';

const F = {
  env:  { key: 'environment', type: 'single-select', options: ['Production', 'Staging'] },
  tags: { key: 'tags', type: 'multi-value' },
  mon:  { key: 'monitoring', type: 'boolean' },
  ret:  { key: 'retentionDays', type: 'number', min: 1, max: 365 },
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
  const groups = groupByTransition(p, F.env, 'set');

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
  const groups = groupByTransition(p, F.env, 'set');

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
  const groups = groupByTransition(p, F.ret, 'decreaseBy');

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
