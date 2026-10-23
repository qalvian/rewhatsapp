// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildRanks, buildKeyframes } from '../src/ui/motion/text-reveal.js';

describe('Text Reveal pure helpers', () => {
  describe('buildRanks', () => {
    it('is deterministic for the same input across multiple runs', () => {
      const text = "Let's rewind those smiles.";
      const r1 = buildRanks(10, 'random', text);
      const r2 = buildRanks(10, 'random', text);
      assert.deepEqual(r1, r2);
    });

    it('covers every index once for random', () => {
      const count = 12;
      const ranks = buildRanks(count, 'random', 'Sample test sentence seed');
      assert.equal(ranks.length, count);
      const sorted = [...ranks].sort((a, b) => a - b);
      assert.deepEqual(
        sorted,
        Array.from({ length: count }, (_, i) => i),
      );
    });

    it('is symmetric for center', () => {
      const countOdd = 5;
      const oddRanks = buildRanks(countOdd, 'center', '');
      // Center of 5: [2, 1, 0, 1, 2]
      assert.equal(oddRanks[0], oddRanks[4]);
      assert.equal(oddRanks[1], oddRanks[3]);
      assert.equal(oddRanks[2], 0);

      const countEven = 6;
      const evenRanks = buildRanks(countEven, 'center', '');
      assert.equal(evenRanks[0], evenRanks[5]);
      assert.equal(evenRanks[1], evenRanks[4]);
      assert.equal(evenRanks[2], evenRanks[3]);
    });

    it('orders correctly for start and end', () => {
      assert.deepEqual(buildRanks(4, 'start', ''), [0, 1, 2, 3]);
      assert.deepEqual(buildRanks(4, 'end', ''), [3, 2, 1, 0]);
    });
  });

  describe('buildKeyframes', () => {
    /** @type {import('../src/ui/motion/text-reveal.js').Effect[]} */
    const effects = ['blur', 'zoom', 'tilt', 'focus', 'drift'];
    /** @type {import('../src/ui/motion/text-reveal.js').Direction[]} */
    const directions = ['top', 'bottom', 'left', 'right'];

    effects.forEach((effect) => {
      directions.forEach((direction) => {
        it(`returns 3 frames for effect=${effect} direction=${direction}`, () => {
          const frames = buildKeyframes(effect, direction, 10, 24);
          assert.equal(frames.length, 3);
          frames.forEach((f) => {
            assert.ok('filter' in f, 'Each frame must have filter');
            assert.ok('opacity' in f, 'Each frame must have opacity');
            assert.ok('transform' in f, 'Each frame must have transform');
          });
        });

        it(`has same sequence of transform functions across frames for effect=${effect} direction=${direction}`, () => {
          const frames = buildKeyframes(effect, direction, 10, 24);
          /**
           * Extracts transform function names (e.g., 'translateY', 'scale', 'perspective')
           * @param {string} transformStr
           * @returns {string[]}
           */
          function extractTransformFunctions(transformStr) {
            const matches = transformStr.match(/[a-zA-Z0-9]+(?=\()/g);
            return matches || [];
          }

          const signatures = frames.map((f) => extractTransformFunctions(String(f.transform)));
          assert.deepEqual(
            signatures[0],
            signatures[1],
            'Frame 0 and 1 must have same transform function list',
          );
          assert.deepEqual(
            signatures[1],
            signatures[2],
            'Frame 1 and 2 must have same transform function list',
          );
        });
      });
    });
  });
});
