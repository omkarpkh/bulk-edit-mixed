// Every number omkarux.com/bulk-edit/model/ quotes, computed from the model.
//
// `npm run figures` writes them to demo/figures.json. spec/published-figures.test.js
// recomputes them from source and fails if that file has gone stale, so the page
// can only be wrong for as long as nobody runs the tests.

import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { plan, describe, groupByTransition } from '../src/model.js';
import { FIELDS, makeHosts } from '../demo/fixture.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const readJSON = p => JSON.parse(readFileSync(resolve(root, p), 'utf8'));

export function computeFigures() {
  const hosts = readJSON('demo/hosts.json');
  const tags = readJSON('spec/fields.json').fields.find(f => f.key === 'tags');
  const example = plan(hosts, tags, 'add', 'monitored');

  const fleet = makeHosts(200);
  const environment = FIELDS.find(f => f.key === 'environment');
  const groups = groupByTransition(plan(fleet, environment, 'set', 'prod'), environment, 'set', 'prod');

  return {
    quotedBy: 'https://omkarux.com/bulk-edit/model/',
    example: {
      dataset: 'demo/hosts.json',
      hosts: hosts.length,
      call: "plan(hosts, tags, 'add', 'monitored')",
      willChange: example.counts.changing,
      alreadyMatch: example.counts.unchanged,
      reads: describe(example),
    },
    grouping: {
      dataset: 'demo/fixture.js',
      hosts: fleet.length,
      call: "groupByTransition(plan(hosts, environment, 'set', 'prod'), environment, 'set', 'prod')",
      groups: groups.map(g => ({ label: g.label, hosts: g.total })),
    },
    tests: { file: 'spec/model.test.js', count: countTests('spec/model.test.js') },
  };
}

// The count comes from running the suite, not from reading it: a test added in a
// loop, or commented out, is counted the way the runner counts it.
function countTests(file) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;   // set when this runs inside `node --test`; the child must report normally
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', file], { cwd: root, env, encoding: 'utf8' });
  const m = run.stdout.match(/^# tests (\d+)$/m);
  if (!m) throw new Error(`could not count the tests in ${file}\n${run.stdout}${run.stderr}`);
  return Number(m[1]);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const figures = computeFigures();
  writeFileSync(resolve(root, 'demo/figures.json'), JSON.stringify(figures, null, 2) + '\n');
  console.log(`wrote demo/figures.json: ${figures.example.reads} · ${figures.grouping.groups.map(g => `${g.label} ${g.hosts}`).join(' · ')} · ${figures.tests.count} tests`);
}
