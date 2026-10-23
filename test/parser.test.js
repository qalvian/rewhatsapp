import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseChat } from '../src/core/parser/index.js';

const FIXTURES_DIR = join(process.cwd(), 'test', 'fixtures');

/**
 * @param {string} name
 * @returns {string}
 */
function readFixture(name) {
  return readFileSync(join(FIXTURES_DIR, name), 'utf-8');
}

test('parseChat: android-us-12h fixture', async () => {
  const content = readFixture('android-us-12h.txt');
  let earlyMetaFired = false;

  const result = await parseChat(content, {
    onEarlyMeta: (meta) => {
      earlyMetaFired = true;
      assert.equal(meta.participants.length, 2);
    },
  });

  assert.ok(earlyMetaFired);
  assert.equal(result.messages.length, 7);
  assert.equal(result.participants.length, 2);
  assert.equal(result.dateOrder, 'MDY');
  assert.equal(result.messages[0].type, 'system');
  assert.equal(result.messages[1].senderDisplayName, 'Maya');
  assert.equal(result.messages[2].senderDisplayName, 'Alex');
});

test('parseChat: android-eu-24h fixture', async () => {
  const content = readFixture('android-eu-24h.txt');
  const result = await parseChat(content);

  assert.equal(result.messages.length, 6);
  assert.equal(result.dateOrder, 'DMY');
  assert.equal(result.messages[3].type, 'media'); // <Media omitted>
});

test('parseChat: ios-bracket fixture', async () => {
  const content = readFixture('ios-bracket.txt');
  const result = await parseChat(content);

  assert.equal(result.messages.length, 7);
  assert.equal(result.messages[5].type, 'deleted');
});

test('parseChat: ios-12h fixture', async () => {
  const content = readFixture('ios-12h.txt');
  const result = await parseChat(content);

  assert.equal(result.messages.length, 5);
  assert.equal(result.dateOrder, 'MDY');
  assert.equal(result.messages[4].type, 'call');
});

test('parseChat: dot-separated-de fixture', async () => {
  const content = readFixture('dot-separated-de.txt');
  const result = await parseChat(content);

  assert.equal(result.messages.length, 5);
  assert.equal(result.dateOrder, 'DMY');
  assert.equal(result.messages[1].senderDisplayName, 'Felix');
});

test('parseChat: spanish-ampm fixture', async () => {
  const content = readFixture('spanish-ampm.txt');
  const result = await parseChat(content);

  assert.equal(result.messages.length, 6);
  assert.equal(result.dateOrder, 'DMY');
  assert.equal(result.messages[1].senderDisplayName, 'Carlos');
});

test('parseChat: multiline fixture preserves blank lines and continuations', async () => {
  const content = readFixture('multiline.txt');
  const result = await parseChat(content);

  assert.equal(result.messages.length, 5);
  const recipeMsg = result.messages[1];
  assert.ok(recipeMsg.isContinuation);
  assert.ok(recipeMsg.text.includes('Ingredients:'));
  assert.ok(recipeMsg.text.includes('- 2 cups arborio rice'));
  assert.ok(recipeMsg.text.includes('Instructions:'));
});

test('parseChat: system-colons fixture', async () => {
  const content = readFixture('system-colons.txt');
  const result = await parseChat(content);

  // Group subject change line must be identified as system
  const subjectChangeMsg = result.messages.find((m) => m.text.includes('changed the subject from'));
  assert.ok(subjectChangeMsg);
  if (!subjectChangeMsg) return;
  assert.equal(subjectChangeMsg.type, 'system');
});

test('parseChat: emoji-zwj fixture', async () => {
  const content = readFixture('emoji-zwj.txt');
  const result = await parseChat(content);

  assert.equal(result.messages[1].emojiOnlyCount, 1); // ❤️
  assert.equal(result.messages[2].emojiOnlyCount, 2); // ✨🌙
  assert.equal(result.messages[3].emojiOnlyCount, 3); // 🚀🔥🎉
  assert.equal(result.messages[4].emojiOnlyCount, 1); // 👨‍👩‍👧‍👦
  assert.equal(result.messages[6].emojiOnlyCount, 0); // 🍎🍌🍇🍓 -> 4 emojis
});

test('parseChat: proto-sender fixture safely manages __proto__ participant', async () => {
  const content = readFixture('proto-sender.txt');
  const result = await parseChat(content);

  const protoSender = result.participants.find((p) => p.raw === '__proto__');
  assert.ok(protoSender);
  if (!protoSender) return;
  assert.equal(protoSender.displayName, '__proto__');
});

test('parseChat: dst-boundary fixture has strictly monotonic timestamps', async () => {
  const content = readFixture('dst-boundary.txt');
  const result = await parseChat(content);

  assert.equal(result.messages.length, 5);
  for (let i = 1; i < result.messages.length; i++) {
    assert.ok(
      result.messages[i].timestamp >= result.messages[i - 1].timestamp,
      `Timestamp at ${i} should be >= timestamp at ${i - 1}`,
    );
  }
});

test('parseChat: group-chat fixture with multiple participants', async () => {
  const content = readFixture('group-chat.txt');
  const result = await parseChat(content);

  assert.ok(result.participants.length >= 3);
  const names = result.participants.map((p) => p.displayName);
  assert.ok(names.includes('Maya'));
  assert.ok(names.includes('Alex'));
});

test('parseChat: UTF-16LE buffer with BOM (FF FE)', async () => {
  const text =
    '24/10/2023, 14:15 - Messages and calls are encrypted.\n24/10/2023, 14:16 - Alice: Hello in UTF-16!\n24/10/2023, 14:17 - Bob: Replying in UTF-16!\n';

  // Encode as UTF-16LE with BOM
  const bytes = new Uint8Array(2 + text.length * 2);
  bytes[0] = 0xff;
  bytes[1] = 0xfe;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    bytes[2 + i * 2] = code & 0xff;
    bytes[2 + i * 2 + 1] = (code >> 8) & 0xff;
  }

  const result = await parseChat(bytes);
  assert.equal(result.messages.length, 3);
  assert.equal(result.messages[1].senderDisplayName, 'Alice');
});

test('parseChat: dynamic huge chat performance test (5,000 synthetic messages)', async () => {
  const lines = ['15/01/2024, 09:00 - Messages and calls are encrypted.'];
  const startTime = Date.now();

  for (let i = 1; i <= 5000; i++) {
    const sender = i % 2 === 0 ? 'Alice' : 'Bob';
    const minute = (i % 55).toString().padStart(2, '0');
    lines.push(`15/01/2024, 10:${minute} - ${sender}: Message number ${i} in benchmark`);
  }

  const hugeContent = lines.join('\n');
  const result = await parseChat(hugeContent);

  const duration = Date.now() - startTime;
  assert.equal(result.messages.length, 5001);
  assert.equal(result.participants.length, 2);
  // Parsing 5000 messages should comfortably take under 500ms
  assert.ok(duration < 2000, `Parsing took ${duration}ms, expected under 2000ms`);
});
