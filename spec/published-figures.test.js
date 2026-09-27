// omkarux.com/bulk-edit/model/ quotes numbers from this repo, and so does the README.
// This recomputes them from source. If the model, the data or the suite changes,
// it fails and names the page that is now wrong.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeFigures } from '../scripts/figures.mjs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const published = JSON.parse(read('demo/figures.json'));

test('demo/figures.json still matches what the model computes', () => {
  assert.deepEqual(computeFigures(), published,
    'figures.json is stale — omkarux.com/bulk-edit/model/ quotes these numbers. Run `npm run figures`, then update the page.');
});

test('the README quotes the same numbers as demo/figures.json', () => {
  const readme = read('README.md').replace(/[ \t]+/g, ' ');
  const quoted = [
    `spec/model.test.js ${published.tests.count} tests`,
    `demo/hosts.json ${published.example.hosts} hosts`,
    ...published.grouping.groups.map(g => `${g.label} ${g.hosts} hosts`),
  ];
  for (const q of quoted) assert.ok(readme.includes(q), `README.md is stale — it should read "${q}"`);
});
