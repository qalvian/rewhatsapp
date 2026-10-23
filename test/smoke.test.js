import { test } from 'node:test';
import assert from 'node:assert/strict';

test('foundations: smoke test environment verification', () => {
  assert.equal(typeof process, 'object');
  assert.equal(1 + 1, 2);
});
