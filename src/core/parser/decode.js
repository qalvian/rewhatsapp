// @ts-check

/**
 * Sniffs Byte Order Mark (BOM) from an ArrayBuffer or Uint8Array and decodes into a string.
 * Supports UTF-8, UTF-16LE, and UTF-16BE. If no BOM is detected, defaults to UTF-8.
 *
 * @param {ArrayBuffer | Uint8Array | string} input
 * @returns {string}
 */
export function decodeChatContent(input) {
  if (typeof input === 'string') {
    // Strip UTF-8 BOM if present as a string character (\uFEFF)
    return input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length === 0) return '';

  // 1. Check UTF-8 BOM: EF BB BF
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes.subarray(3));
  }

  // 2. Check UTF-16LE BOM: FF FE
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    const decoder = new TextDecoder('utf-16le');
    return decoder.decode(bytes.subarray(2));
  }

  // 3. Check UTF-16BE BOM: FE FF
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const decoder = new TextDecoder('utf-16be');
    return decoder.decode(bytes.subarray(2));
  }

  // Fallback: UTF-8 decoder without BOM
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(bytes);
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}
