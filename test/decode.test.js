import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeChatContent } from '../src/core/parser/decode.js';

test('decodeChatContent: string input with or without UTF-8 BOM', () => {
  assert.equal(decodeChatContent('Hello world'), 'Hello world');
  assert.equal(decodeChatContent('\uFEFFHello world with BOM'), 'Hello world with BOM');
});

test('decodeChatContent: Uint8Array UTF-8 with BOM (EF BB BF)', () => {
  const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 0x48, 0x69]); // "Hi"
  assert.equal(decodeChatContent(bytes), 'Hi');
});

test('decodeChatContent: Uint8Array UTF-16LE with BOM (FF FE)', () => {
  // "Hi" in UTF-16LE: H = 0x0048, i = 0x0069
  const bytes = new Uint8Array([0xff, 0xfe, 0x48, 0x00, 0x69, 0x00]);
  assert.equal(decodeChatContent(bytes), 'Hi');
});

test('decodeChatContent: Uint8Array UTF-16BE with BOM (FE FF)', () => {
  // "Hi" in UTF-16BE: H = 0x0048, i = 0x0069
  const bytes = new Uint8Array([0xfe, 0xff, 0x00, 0x48, 0x00, 0x69]);
  assert.equal(decodeChatContent(bytes), 'Hi');
});

test('decodeChatContent: Uint8Array fallback without BOM (defaults to UTF-8)', () => {
  const bytes = new Uint8Array([0x48, 0x65, 0x79]); // "Hey"
  assert.equal(decodeChatContent(bytes), 'Hey');
});
