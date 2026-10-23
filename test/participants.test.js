import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  discoverParticipants,
  resolveSender,
  formatDisplayName,
} from '../src/core/parser/participants.js';

test('formatDisplayName: strips leading tilde and extra whitespace', () => {
  assert.equal(formatDisplayName('~Alex  Smith'), 'Alex Smith');
  assert.equal(formatDisplayName('+91  98765   43210'), '+91 98765 43210');
  assert.equal(formatDisplayName('__proto__'), '__proto__');
});

test('discoverParticipants & resolveSender: filters system events with colons', () => {
  const tokens = [
    { body: 'Messages and calls are end-to-end encrypted.' },
    { body: 'Alice created group "Weekend Getaway"' },
    { body: 'Alice changed the subject from "Trip: Spain" to "Trip: Portugal"' },
    { body: "Bob: Perfect, let's go!" },
    { body: 'Alice: I found a gorgeous villa near Sintra.' },
    { body: 'Bob: What about flights?' },
    { body: 'Alice: Looking into Ryanair.' },
  ];

  const participants = discoverParticipants(tokens);

  // 'Alice' and 'Bob' should be discovered
  assert.ok(participants.has('Alice'));
  assert.ok(participants.has('Bob'));

  // Ensure system messages with internal colons are classified as system
  const subjectChange = resolveSender(tokens[2].body, participants);
  assert.equal(subjectChange.isSystem, true);

  const bobMsg = resolveSender(tokens[3].body, participants);
  assert.equal(bobMsg.isSystem, false);
  assert.equal(bobMsg.senderRaw, 'Bob');
  assert.equal(bobMsg.text, "Perfect, let's go!");
});

test('discoverParticipants: safely handles __proto__ as a participant name', () => {
  const tokens = [
    { body: 'Messages and calls are end-to-end encrypted.' },
    { body: '__proto__: Testing prototype pollution' },
    { body: '__proto__: Still working!' },
    { body: "Alice: Glad it didn't crash." },
    { body: 'Alice: Nice job.' },
  ];

  const participants = discoverParticipants(tokens);
  assert.ok(participants.has('__proto__'));
  const protoPart = participants.get('__proto__');
  assert.ok(protoPart);
  if (!protoPart) return;
  assert.equal(protoPart.displayName, '__proto__');
  assert.equal(protoPart.messageCount, 2);
});
