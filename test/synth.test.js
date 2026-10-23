import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateWaveformData } from '../src/audio/synth.js';

test('generateWaveformData: produces deterministic, stable waveforms', () => {
  const seed = 'PTT-20240115-WA0001.opus';
  const waveformA = generateWaveformData(seed, 36);
  const waveformB = generateWaveformData(seed, 36);

  assert.equal(waveformA.length, 36);
  assert.equal(waveformB.length, 36);
  assert.deepEqual(waveformA, waveformB, 'Waveforms generated from same seed must be identical');

  const differentSeed = 'PTT-20240115-WA0002.opus';
  const waveformC = generateWaveformData(differentSeed, 36);
  assert.notDeepEqual(waveformA, waveformC, 'Different seeds must produce different waveforms');

  // Verify all bar values are within valid normalized visual range (0.15 to 1.0)
  for (const bar of waveformA) {
    assert.ok(bar >= 0.15 && bar <= 1.0, `Bar value ${bar} out of bounds [0.15, 1.0]`);
  }
});
