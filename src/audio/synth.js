// @ts-check

/**
 * Web Audio API synthesizer for zero-asset audio effects and deterministic waveform generation.
 */

/** @type {AudioContext | null} */
let audioCtx = null;
let isMuted = false;

// Initialize mute state from localStorage
if (typeof localStorage !== 'undefined') {
  try {
    isMuted = localStorage.getItem('rewhatsapp_muted') === 'true';
  } catch {
    // Ignore localStorage restrictions
  }
}

/**
 * Lazily obtains an active AudioContext.
 * @returns {AudioContext | null}
 */
function getAudioContext() {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Checks whether audio is currently muted.
 * @returns {boolean}
 */
export function getIsMuted() {
  return isMuted;
}

/**
 * Sets audio mute state and persists to localStorage.
 * @param {boolean} muted
 */
export function setMuted(muted) {
  isMuted = muted;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('rewhatsapp_muted', muted ? 'true' : 'false');
    } catch {
      // Ignore
    }
  }
}

/**
 * Toggles audio mute state.
 * @returns {boolean} New mute state
 */
export function toggleMuted() {
  setMuted(!isMuted);
  return isMuted;
}

/**
 * Synthesizes a soft outgoing message pop sound.
 */
export function playSendSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * Synthesizes a gentle incoming message notification chime.
 */
export function playReceiveSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'sine';

  osc1.frequency.setValueAtTime(659.25, now); // E5
  osc2.frequency.setValueAtTime(880, now + 0.04); // A5

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.06);
  osc2.start(now + 0.04);
  osc2.stop(now + 0.18);
}

/**
 * Synthesizes a subtle wooden tick / time skip click.
 */
export function playTickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(2200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
}

/**
 * Generates deterministic waveform heights (0.15 to 1.0) seeded by a string hash.
 * Ensures the audio placeholder waveform is consistent across multiple replays.
 *
 * @param {string} seedStr
 * @param {number} [numBars=36]
 * @returns {number[]} Array of normalized bar heights (0.15 to 1.0)
 */
export function generateWaveformData(seedStr, numBars = 36) {
  // FNV-1a 32-bit hash
  let hash = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  const heights = new Array(numBars);
  let state = hash >>> 0;

  for (let i = 0; i < numBars; i++) {
    // Xorshift32 PRNG
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    const rand = (state >>> 0) / 4294967296;

    // Shaped waveform: natural envelope with speech pauses
    const envelope = Math.sin((i / (numBars - 1)) * Math.PI) * 0.4 + 0.6;
    const height = Math.max(0.18, Math.min(1.0, (rand * 0.75 + 0.25) * envelope));
    heights[i] = Math.round(height * 100) / 100;
  }

  return heights;
}
