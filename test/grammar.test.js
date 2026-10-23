import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectGrammar, matchHeader, CANDIDATE_GRAMMARS } from '../src/core/parser/grammar.js';

test('detectGrammar: identifies Android standard 24h format', () => {
  const sample = [
    '24/10/2023, 14:15 - Messages and calls are end-to-end encrypted.',
    '24/10/2023, 14:16 - Lucas: Salut! Did you finish reviewing the proposal?',
    '24/10/2023, 14:18 - Sophie: Hey Lucas! Yes, just sent you my comments.',
  ];
  const grammar = detectGrammar(sample);
  assert.equal(grammar.family, 'android');
  assert.equal(grammar.is12Hour, false);
});

test('detectGrammar: identifies Android US 12h format', () => {
  const sample = [
    '10/24/23, 9:15 AM - Messages and calls are encrypted.',
    '10/24/23, 9:16 AM - Maya: Hey! Are you still up for coffee?',
    '10/24/23, 9:17 AM - Alex: Good morning! Absolutely.',
  ];
  const grammar = detectGrammar(sample);
  assert.equal(grammar.family, 'android');
  assert.equal(grammar.is12Hour, true);
});

test('detectGrammar: identifies iOS bracketed format with seconds', () => {
  const sample = [
    '[14/02/24, 18:30:15] Messages and calls are end-to-end encrypted.',
    '[14/02/24, 18:31:02] Elena: Happy Valentine!',
    '[14/02/24, 18:32:10] Liam: Are we still on?',
  ];
  const grammar = detectGrammar(sample);
  assert.equal(grammar.family, 'ios');
  assert.equal(grammar.hasSeconds, true);
});

test('detectGrammar: identifies German dot-separated 24h format', () => {
  const sample = [
    '12.03.24, 08:45 - Nachrichten und Anrufe sind verschlüsselt.',
    '12.03.24, 08:47 - Felix: Guten Morgen!',
    '12.03.24, 08:49 - Hannah: Fast da.',
  ];
  const grammar = detectGrammar(sample);
  assert.equal(grammar.dateSeparator, '.');
  assert.equal(grammar.is12Hour, false);
});

test('matchHeader: rejects wrapped message lines without delimiter', () => {
  const grammar = CANDIDATE_GRAMMARS.find((g) => g.id === 'android-slash-24h');
  assert.ok(grammar);
  if (!grammar) return;

  // Wrapped lines that happen to start with date/time-like text
  const wrappedLine1 = '12/5, 10:30 meeting at headquarters with the team';
  const wrappedLine2 = '15/1/24 was a great day';

  assert.equal(matchHeader(wrappedLine1, grammar), null);
  assert.equal(matchHeader(wrappedLine2, grammar), null);
});
