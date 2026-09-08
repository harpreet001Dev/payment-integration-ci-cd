import test from 'node:test';
import assert from 'node:assert';
// Testing PR CI
test('basic calculation works', () => {
  const amount = 100;
  const tax = 18;

  const total = amount + tax;

  assert.strictEqual(total, 118);
});