// @ts-check

/**
 * @typedef {Object} ZipEntry
 * @property {string} filename
 * @property {number} compressionMethod 0 = stored, 8 = deflate
 * @property {number} compressedSize
 * @property {number} uncompressedSize
 * @property {number} localHeaderOffset
 * @property {() => Promise<Uint8Array>} extract
 */

/**
 * Checks whether an ArrayBuffer or Uint8Array starts with the ZIP magic number (PK\x03\x04).
 * @param {ArrayBuffer | Uint8Array} buffer
 * @returns {boolean}
 */
export function isZipArchive(buffer) {
  const bytes =
    buffer instanceof Uint8Array
      ? buffer
      : new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength));
  if (bytes.byteLength < 4) return false;
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

/**
 * Micro ZIP reader utilizing Web Stream DecompressionStream('deflate-raw').
 * Zero external libraries, works in both modern browser and Node.js >= 18 environments.
 *
 * @param {ArrayBuffer} buffer
 * @returns {Promise<Map<string, ZipEntry>>}
 */
export async function readZipEntries(buffer) {
  const dataView = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const len = buffer.byteLength;

  // 1. Locate End of Central Directory (EOCD) signature 0x06054b50 by searching backward from end
  let eocdOffset = -1;
  const minEocdSearch = Math.max(0, len - 65557); // 22 bytes EOCD + max 65535 comment length
  for (let i = len - 22; i >= minEocdSearch; i--) {
    if (dataView.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Invalid ZIP archive: End of Central Directory record not found.');
  }

  const cdTotalEntries = dataView.getUint16(eocdOffset + 10, true);
  const cdOffset = dataView.getUint32(eocdOffset + 16, true);

  /** @type {Map<string, ZipEntry>} */
  const entries = new Map();
  let currentOffset = cdOffset;
  const textDecoder = new TextDecoder('utf-8');

  for (let i = 0; i < cdTotalEntries; i++) {
    if (currentOffset + 46 > len) break;
    const sig = dataView.getUint32(currentOffset, true);
    if (sig !== 0x02014b50) break; // Central directory file header signature

    const compressionMethod = dataView.getUint16(currentOffset + 10, true);
    const compressedSize = dataView.getUint32(currentOffset + 20, true);
    const uncompressedSize = dataView.getUint32(currentOffset + 24, true);
    const filenameLen = dataView.getUint16(currentOffset + 28, true);
    const extraLen = dataView.getUint16(currentOffset + 30, true);
    const commentLen = dataView.getUint16(currentOffset + 32, true);
    const localHeaderOffset = dataView.getUint32(currentOffset + 42, true);

    const filenameBytes = bytes.subarray(currentOffset + 46, currentOffset + 46 + filenameLen);
    const filename = textDecoder.decode(filenameBytes);

    currentOffset += 46 + filenameLen + extraLen + commentLen;

    entries.set(filename, {
      filename,
      compressionMethod,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
      extract: async () => {
        // Read local header to get exact data offset
        if (localHeaderOffset + 30 > len) {
          throw new Error(`Corrupted ZIP: local header out of bounds for ${filename}`);
        }
        const localSig = dataView.getUint32(localHeaderOffset, true);
        if (localSig !== 0x04034b50) {
          throw new Error(`Invalid local header signature for ${filename}`);
        }
        const localNameLen = dataView.getUint16(localHeaderOffset + 26, true);
        const localExtraLen = dataView.getUint16(localHeaderOffset + 28, true);
        const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
        const compressedData = bytes.subarray(dataStart, dataStart + compressedSize);

        if (compressionMethod === 0) {
          // Stored (uncompressed)
          return compressedData;
        } else if (compressionMethod === 8) {
          // Deflate: decompress using DecompressionStream('deflate-raw')
          if (typeof DecompressionStream === 'undefined') {
            throw new Error('DecompressionStream API is not supported in this runtime.');
          }
          const stream = new Response(compressedData).body?.pipeThrough(
            new DecompressionStream('deflate-raw'),
          );
          if (!stream) {
            throw new Error('Failed to create decompression stream.');
          }
          const decompressedBuffer = await new Response(stream).arrayBuffer();
          return new Uint8Array(decompressedBuffer);
        } else {
          throw new Error(`Unsupported compression method ${compressionMethod} for ${filename}`);
        }
      },
    });
  }

  return entries;
}

/**
 * Extracts chat text file and optional media entries from a WhatsApp iOS/Android ZIP archive.
 *
 * @param {ArrayBuffer} buffer
 * @returns {Promise<{ chatText: string; mediaBlobs: Map<string, Blob> }>}
 */
export async function extractChatFromZip(buffer) {
  const entries = await readZipEntries(buffer);

  // WhatsApp iOS exports place the conversation in '_chat.txt'
  let chatEntry = entries.get('_chat.txt');
  if (!chatEntry) {
    // Check case-insensitive variations
    for (const [name, entry] of entries.entries()) {
      if (name.toLowerCase().endsWith('_chat.txt') || name.toLowerCase().endsWith('chat.txt')) {
        chatEntry = entry;
        break;
      }
    }
  }

  if (!chatEntry) {
    throw new Error('No WhatsApp chat file (_chat.txt) found in ZIP archive.');
  }

  const chatBytes = await chatEntry.extract();
  const decoder = new TextDecoder('utf-8');
  const chatText = decoder.decode(chatBytes);

  /** @type {Map<string, Blob>} */
  const mediaBlobs = new Map();

  return { chatText, mediaBlobs };
}
