import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyMessage } from '../src/core/parser/classify.js';

test('classifyMessage: identifies deleted message variations', () => {
  assert.equal(classifyMessage('This message was deleted', false).type, 'deleted');
  assert.equal(classifyMessage('You deleted this message.', false).type, 'deleted');
  assert.equal(classifyMessage('Este mensaje fue eliminado', false).type, 'deleted');
  assert.equal(classifyMessage('Diese Nachricht wurde gelöscht', false).type, 'deleted');
});

test('classifyMessage: identifies calls and missed calls', () => {
  assert.equal(classifyMessage('Missed voice call', false).type, 'call');
  assert.equal(classifyMessage('Missed video call', false).type, 'call');
  assert.equal(classifyMessage('Llamada perdida', false).type, 'call');
});

test('classifyMessage: identifies media placeholders and extracts filenames', () => {
  const photo = classifyMessage('<attached: 0001-PHOTO-2024-01-15.jpg>', false);
  assert.equal(photo.type, 'media');
  assert.equal(photo.mediaInfo?.kind, 'image');
  assert.equal(photo.mediaInfo?.filename, '0001-PHOTO-2024-01-15.jpg');

  const voice = classifyMessage('<attached: PTT-20240115-WA0001.opus>', false);
  assert.equal(voice.type, 'voice');
  assert.equal(voice.mediaInfo?.kind, 'voice');

  const general = classifyMessage('<Media omitted>', false);
  assert.equal(general.type, 'media');
});

test('classifyMessage: detects 1-3 emoji graphemes for enlargement', () => {
  const single = classifyMessage('❤️', false);
  assert.equal(single.type, 'text');
  assert.equal(single.emojiOnlyCount, 1);

  const double = classifyMessage('✨🌙', false);
  assert.equal(double.emojiOnlyCount, 2);

  const triple = classifyMessage('🚀🔥🎉', false);
  assert.equal(triple.emojiOnlyCount, 3);

  const four = classifyMessage('🍎🍌🍇🍓', false);
  assert.equal(four.emojiOnlyCount, 0); // 4 emojis -> normal text size

  const textWithEmoji = classifyMessage('Hello ❤️', false);
  assert.equal(textWithEmoji.emojiOnlyCount, 0);

  const zwjFamily = classifyMessage('👨‍👩‍👧‍👦', false);
  assert.equal(zwjFamily.emojiOnlyCount, 1); // 1 composite emoji grapheme
});
