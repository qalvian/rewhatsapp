import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inferDateOrder, parseClock, parseDateTimeToUtc } from '../src/core/parser/dates.js';

test('inferDateOrder: first field > 12 strictly constrains DMY', () => {
  const dates = ['15/01/2024', '16/01/2024', '20/01/2024'];
  const result = inferDateOrder(dates, false);
  assert.equal(result.order, 'DMY');
  assert.equal(result.confidence, 1.0);
});

test('inferDateOrder: second field > 12 strictly constrains MDY', () => {
  const dates = ['01/15/2024', '01/16/2024', '01/20/2024'];
  const result = inferDateOrder(dates, true);
  assert.equal(result.order, 'MDY');
  assert.equal(result.confidence, 1.0);
});

test('inferDateOrder: 4-digit first field identifies YMD', () => {
  const dates = ['2024-01-15', '2024-01-16', '2024-01-20'];
  const result = inferDateOrder(dates, false);
  assert.equal(result.order, 'YMD');
  assert.equal(result.confidence, 1.0);
});

test('inferDateOrder: ambiguous dates evaluated by chronological monotonicity', () => {
  // 01/02, 03/02, 05/02, 08/02 -> in DMY this is Feb 1, Feb 3, Feb 5, Feb 8 (monotonic!)
  // In MDY this would be Jan 2, Mar 2, May 2, Aug 2
  const dates = ['01/02/2024', '03/02/2024', '05/02/2024', '08/02/2024'];
  const result = inferDateOrder(dates, false);
  assert.ok(result.order === 'DMY' || result.order === 'MDY');
  assert.ok(result.confidence > 0.5);
});

test('parseClock: 12-hour AM/PM normalization', () => {
  assert.deepEqual(parseClock('12:00 AM'), { hours: 0, minutes: 0, seconds: 0 });
  assert.deepEqual(parseClock('12:30 AM'), { hours: 0, minutes: 30, seconds: 0 });
  assert.deepEqual(parseClock('12:00 PM'), { hours: 12, minutes: 0, seconds: 0 });
  assert.deepEqual(parseClock('1:15 PM'), { hours: 13, minutes: 15, seconds: 0 });
  assert.deepEqual(parseClock('11:45 PM'), { hours: 23, minutes: 45, seconds: 0 });
  assert.deepEqual(parseClock('2:30:15 p. m.'), { hours: 14, minutes: 30, seconds: 15 });
  assert.deepEqual(parseClock('9:05:00 a. m.'), { hours: 9, minutes: 5, seconds: 0 });
});

test('parseDateTimeToUtc: floating UTC construction without DST offset drift', () => {
  const ts1 = parseDateTimeToUtc('15/01/2024', '14:30', 'DMY');
  const date1 = new Date(ts1);
  assert.equal(date1.getUTCFullYear(), 2024);
  assert.equal(date1.getUTCMonth(), 0); // January (0-indexed)
  assert.equal(date1.getUTCDate(), 15);
  assert.equal(date1.getUTCHours(), 14);
  assert.equal(date1.getUTCMinutes(), 30);
  assert.equal(date1.getUTCSeconds(), 0);

  // Two-digit year expansion
  const ts2 = parseDateTimeToUtc('10/24/23', '9:15 AM', 'MDY');
  const date2 = new Date(ts2);
  assert.equal(date2.getUTCFullYear(), 2023);
  assert.equal(date2.getUTCMonth(), 9); // October
  assert.equal(date2.getUTCDate(), 24);
  assert.equal(date2.getUTCHours(), 9);
  assert.equal(date2.getUTCMinutes(), 15);
});
