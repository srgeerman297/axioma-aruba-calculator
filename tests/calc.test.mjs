import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .find(source => source.includes('function dutyFor('));
assert.ok(script, 'Calculator script must exist');

// Load the real duty table and pure helpers without running browser startup.
const duties = script.match(/const DUTIES=\[[\s\S]*?\n\s*\];/);
assert.ok(duties, 'Duty table must exist');
const names = ['n', 'ceil05', 'ceilWhole', 'parseMoneyNumber', 'dutyFor'];
const helpers = names.map(name => {
  const match = script.match(new RegExp(`^\\s*function ${name}\\([^\\n]+`, 'm'));
  assert.ok(match, `Helper ${name} must exist`);
  return match[0];
});
const { ceil05, ceilWhole, parseMoneyNumber, dutyFor } = runInNewContext(
  `${duties[0]}\n${helpers.join('\n')}\n({${names.join(',')}})`,
  Object.create(null),
  { timeout: 1000 },
);

for (const [input, expected] of [[0, -0], [1.01, 1.05], [1.05, 1.05], [1.051, 1.1], [0.1 + 0.2, 0.3]]) {
  assert.equal(ceil05(input), expected, `ceil05(${input})`);
}
for (const [input, expected] of [[0, -0], [12, 12], [12.01, 13], [12.999, 13], [1 + Number.EPSILON, 1]]) {
  assert.equal(ceilWhole(input), expected, `ceilWhole(${input})`);
}
for (const [input, expected] of [['$123.45', 123.45], ['AWG 1.234,56', 1234.56], ['12,50', 12.5], ['-12.50', -12.5], ['', 0], [null, 0], ['invalid', 0], ['1.2.3', 0]]) {
  assert.equal(parseMoneyNumber(input), expected, `parseMoneyNumber(${JSON.stringify(input)})`);
}
assert.equal(dutyFor('clothing').rate, 6);
assert.equal(dutyFor('books').rate, 0);
assert.equal(dutyFor('smartphone').dtz, true);
assert.equal(dutyFor('unknown-category').key, 'manual12');
assert.equal(dutyFor('unknown-category').rate, 12);

console.log('Calculator tests passed.');
