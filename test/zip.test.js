import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isZipArchive, extractChatFromZip, readZipEntries } from '../src/core/zip.js';

/**
 * Constructs an uncompressed (method 0) ZIP archive in memory for testing.
 * @param {string} filename
 * @param {string} content
 * @returns {ArrayBuffer}
 */
function createSyntheticZip(filename, content) {
  const enc = new TextEncoder();
  const nameBytes = enc.encode(filename);
  const dataBytes = enc.encode(content);

  // CRC-32 calculator
  let crc = 0 ^ -1;
  for (let i = 0; i < dataBytes.length; i++) {
    crc = (crc >>> 8) ^ [0, 0x77073096, 0xee0e612c, 0x990951ba][(crc ^ dataBytes[i]) & 3]; // simplified table lookup
  }
  crc = (crc ^ -1) >>> 0;

  const localHeaderLen = 30 + nameBytes.length;
  const centralDirLen = 46 + nameBytes.length;
  const eocdLen = 22;
  const totalLen = localHeaderLen + dataBytes.length + centralDirLen + eocdLen;

  const buffer = new ArrayBuffer(totalLen);
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);

  // 1. Local File Header
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true); // Version
  view.setUint16(6, 0, true); // Flags
  view.setUint16(8, 0, true); // Compression = 0 (stored)
  view.setUint32(14, crc, true);
  view.setUint32(18, dataBytes.length, true);
  view.setUint32(22, dataBytes.length, true);
  view.setUint16(26, nameBytes.length, true);
  view.setUint16(28, 0, true);
  u8.set(nameBytes, 30);
  u8.set(dataBytes, localHeaderLen);

  // 2. Central Directory
  const cdOffset = localHeaderLen + dataBytes.length;
  view.setUint32(cdOffset, 0x02014b50, true);
  view.setUint16(cdOffset + 4, 20, true);
  view.setUint16(cdOffset + 6, 20, true);
  view.setUint16(cdOffset + 8, 0, true);
  view.setUint16(cdOffset + 10, 0, true);
  view.setUint32(cdOffset + 16, crc, true);
  view.setUint32(cdOffset + 20, dataBytes.length, true);
  view.setUint32(cdOffset + 24, dataBytes.length, true);
  view.setUint16(cdOffset + 28, nameBytes.length, true);
  view.setUint16(cdOffset + 30, 0, true);
  view.setUint16(cdOffset + 32, 0, true);
  view.setUint32(cdOffset + 42, 0, true); // Local header offset = 0
  u8.set(nameBytes, cdOffset + 46);

  // 3. End of Central Directory
  const eocdOffset = cdOffset + centralDirLen;
  view.setUint32(eocdOffset, 0x06054b50, true);
  view.setUint16(eocdOffset + 4, 0, true);
  view.setUint16(eocdOffset + 6, 0, true);
  view.setUint16(eocdOffset + 8, 1, true);
  view.setUint16(eocdOffset + 10, 1, true);
  view.setUint32(eocdOffset + 12, centralDirLen, true);
  view.setUint32(eocdOffset + 16, cdOffset, true);
  view.setUint16(eocdOffset + 20, 0, true);

  return buffer;
}

test('isZipArchive: detects zip header signature 0x04034b50', () => {
  const zipBuffer = createSyntheticZip('_chat.txt', 'test content');
  assert.equal(isZipArchive(zipBuffer), true);
  assert.equal(isZipArchive(new ArrayBuffer(10)), false);
});

test('extractChatFromZip: extracts _chat.txt from zip archive', async () => {
  const chatContent =
    '15/01/2024, 10:00 - Alice: Hello from ZIP!\n15/01/2024, 10:01 - Bob: Received!';
  const zipBuffer = createSyntheticZip('_chat.txt', chatContent);

  const { chatText } = await extractChatFromZip(zipBuffer);
  assert.equal(chatText, chatContent);

  const entries = await readZipEntries(zipBuffer);
  assert.equal(entries.size, 1);
  assert.ok(entries.has('_chat.txt'));
});
