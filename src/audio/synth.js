// @ts-check

/**
 * Web Audio API synthesizer for rewhatsapp.
 * Rebuilt to Brief v3 spec:
 * - Master chain: lowpass (4.5 kHz) -> DynamicsCompressor -> Master Gain (0.35) -> Destination
 * - Reverb: synthetic convolution impulse response (0.6s, 12% wet)
 * - Panning: -0.15 for incoming, +0.15 for outgoing
 * - Send: 520->880 Hz sine sweep (70ms) + faint noise transient (90ms decay)
 * - Receive: Two-note chime (E5 -> B5, 45ms apart, sine + triangle octave, 220ms tail)
 * - Rate limits: silent at >= 10x, max 4 sounds/sec, rapid burst ducking
 * - Persisted volume and mute in localStorage
 */

/** @type {AudioContext | null} */
let audioCtx = null;
/** @type {BiquadFilterNode | null} */
let masterLowpass = null;
/** @type {DynamicsCompressorNode | null} */
let masterCompressor = null;
/** @type {GainNode | null} */
let masterGainNode = null;
/** @type {ConvolverNode | null} */
let reverbConvolver = null;
/** @type {GainNode | null} */
let reverbWetGain = null;
/** @type {GainNode | null} */
let reverbDryGain = null;

let isMuted = false;
let masterVolume = 0.35;
let isTickEnabled = false;
let currentSpeed = 1;

/** @type {number[]} */
const recentSoundTimestamps = [];
let lastSoundTime = 0;

// Read persisted settings
if (typeof localStorage !== 'undefined') {
  try {
    const storedMute = localStorage.getItem('rewhatsapp_muted');
    if (storedMute !== null) isMuted = storedMute === 'true';

    const storedVol = localStorage.getItem('rewhatsapp_volume');
    if (storedVol !== null) {
      const parsed = parseFloat(storedVol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        masterVolume = parsed;
      }
    }
  } catch {
    // Ignore storage restrictions
  }
}

/**
 * Creates an algorithmic impulse response buffer for subtle room warmth.
 * @param {AudioContext} ctx
 * @param {number} durationSeconds
 * @param {number} decay
 * @returns {AudioBuffer}
 */
function createImpulseResponse(ctx, durationSeconds = 0.6, decay = 2.5) {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * durationSeconds);
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-decay * t);
    left[i] = (Math.random() * 2 - 1) * env;
    right[i] = (Math.random() * 2 - 1) * env;
  }

  return impulse;
}

/**
 * Initializes or returns the master audio node graph.
 * @returns {AudioContext | null}
 */
function ensureAudioGraph() {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();

    // 1. Master Lowpass filter (4.5 kHz to cut harsh high frequencies)
    masterLowpass = audioCtx.createBiquadFilter();
    masterLowpass.type = 'lowpass';
    masterLowpass.frequency.setValueAtTime(4500, audioCtx.currentTime);
    masterLowpass.Q.setValueAtTime(0.7, audioCtx.currentTime);

    // 2. Dynamics Compressor for warm rounded peaks
    masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
    masterCompressor.knee.setValueAtTime(25, audioCtx.currentTime);
    masterCompressor.ratio.setValueAtTime(3.5, audioCtx.currentTime);
    masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
    masterCompressor.release.setValueAtTime(0.2, audioCtx.currentTime);

    // 3. Master Gain
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.setValueAtTime(isMuted ? 0 : masterVolume, audioCtx.currentTime);

    // Connect core master chain
    masterLowpass.connect(masterCompressor);
    masterCompressor.connect(masterGainNode);
    masterGainNode.connect(audioCtx.destination);

    // 4. Subtle synthetic reverb branch
    try {
      reverbConvolver = audioCtx.createConvolver();
      reverbConvolver.buffer = createImpulseResponse(audioCtx, 0.5, 3.2);

      reverbWetGain = audioCtx.createGain();
      reverbWetGain.gain.setValueAtTime(0.12, audioCtx.currentTime); // 12% wet

      reverbDryGain = audioCtx.createGain();
      reverbDryGain.gain.setValueAtTime(0.88, audioCtx.currentTime);

      reverbConvolver.connect(reverbWetGain);
      reverbWetGain.connect(masterLowpass);
      reverbDryGain.connect(masterLowpass);
    } catch {
      // Fallback without convolution if buffer creation fails
    }
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

// User-gesture unlock listener
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    ensureAudioGraph();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

/**
 * Checks rate limits. Drops sounds if rate > 4/sec or muted or playback >= 10x.
 * @returns {number} Gain multiplier (1.0 normal, 0.6 if ducked, 0 if dropped)
 */
function checkRateLimitAndDucking() {
  if (isMuted || masterVolume <= 0) return 0;
  if (currentSpeed >= 10) return 0;

  const now = performance.now();

  // Prune timestamps older than 1 second
  while (recentSoundTimestamps.length > 0 && now - recentSoundTimestamps[0] > 1000) {
    recentSoundTimestamps.shift();
  }

  // Max 4 sounds per second
  if (recentSoundTimestamps.length >= 4) {
    return 0;
  }

  recentSoundTimestamps.push(now);

  // Rapid burst ducking: if last sound was <180ms ago, duck volume by 40%
  const duckMultiplier = now - lastSoundTime < 180 ? 0.6 : 1.0;
  lastSoundTime = now;

  return duckMultiplier;
}

/**
 * Sets current playback speed to adjust sound design rate-limits.
 * @param {number} speed
 */
export function setAudioPlaybackSpeed(speed) {
  currentSpeed = speed;
}

/**
 * Checks whether audio is currently muted.
 * @returns {boolean}
 */
export function getIsMuted() {
  return isMuted;
}

/**
 * Sets audio mute state and updates master gain node.
 * @param {boolean} muted
 */
export function setMuted(muted) {
  isMuted = muted;
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGainNode.gain.setValueAtTime(muted ? 0 : masterVolume, audioCtx.currentTime);
  }
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
 * Gets master volume level (0.0 to 1.0).
 * @returns {number}
 */
export function getVolume() {
  return masterVolume;
}

/**
 * Sets master volume level (0.0 to 1.0).
 * @param {number} vol
 */
export function setVolume(vol) {
  masterVolume = Math.max(0, Math.min(1, vol));
  if (masterGainNode && audioCtx && !isMuted) {
    masterGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGainNode.gain.setValueAtTime(masterVolume, audioCtx.currentTime);
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('rewhatsapp_volume', masterVolume.toString());
    } catch {
      // Ignore
    }
  }
}

/**
 * Sets whether micro tick sounds are enabled.
 * @param {boolean} enabled
 */
export function setTickEnabled(enabled) {
  isTickEnabled = enabled;
}

/**
 * Connects an audio node into the master chain with optional panning and reverb.
 * @param {AudioContext} ctx
 * @param {AudioNode} sourceNode
 * @param {number} panX (-1.0 to 1.0)
 * @param {boolean} [withReverb=false]
 */
function routeToMaster(ctx, sourceNode, panX = 0, withReverb = false) {
  /** @type {AudioNode} */
  let head = sourceNode;

  // Stereo panning
  if (panX !== 0 && typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(panX, ctx.currentTime);
    sourceNode.connect(panner);
    head = panner;
  }

  if (withReverb && reverbConvolver && reverbDryGain) {
    head.connect(reverbConvolver);
    head.connect(reverbDryGain);
  } else if (masterLowpass) {
    head.connect(masterLowpass);
  } else {
    head.connect(ctx.destination);
  }
}

/**
 * Synthesizes a soft outgoing message pop sound:
 * Sine sweep 520 -> 880 Hz over 70ms + faint noise transient (90ms decay).
 * Pan: +0.15 (outgoing right)
 */
export function playSendSound() {
  const duck = checkRateLimitAndDucking();
  if (duck === 0) return;

  const ctx = ensureAudioGraph();
  if (!ctx) return;

  const now = ctx.currentTime;
  const pitchVar = 1 + (Math.random() * 0.06 - 0.03); // ±3% natural variation

  // 1. Tonal sine sweep
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(520 * pitchVar, now);
  osc.frequency.exponentialRampToValueAtTime(880 * pitchVar, now + 0.07);

  oscGain.gain.setValueAtTime(0.0001, now);
  oscGain.gain.linearRampToValueAtTime(0.22 * duck, now + 0.005);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

  osc.connect(oscGain);
  routeToMaster(ctx, oscGain, 0.15, false);

  osc.start(now);
  osc.stop(now + 0.1);

  // 2. Faint filtered noise transient for realistic "pop" sensation
  try {
    const noiseLength = Math.floor(ctx.sampleRate * 0.04);
    const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, now);
    noiseFilter.Q.setValueAtTime(1.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.04 * duck, now + 0.003);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    routeToMaster(ctx, noiseGain, 0.15, false);

    noiseSource.start(now);
    noiseSource.stop(now + 0.04);
  } catch {
    // Non-critical if buffer creation fails
  }
}

/**
 * Synthesizes a gentle incoming message notification chime:
 * E5 (659.25 Hz) then B5 (987.77 Hz), 45ms apart, sine + quiet triangle octave,
 * ~220ms tail with light synthesized reverb.
 * Pan: -0.15 (incoming left)
 */
export function playReceiveSound() {
  const duck = checkRateLimitAndDucking();
  if (duck === 0) return;

  const ctx = ensureAudioGraph();
  if (!ctx) return;

  const now = ctx.currentTime;
  const pitchVar = 1 + (Math.random() * 0.06 - 0.03); // ±3% natural variation

  const notes = [
    { freq: 659.25 * pitchVar, time: now }, // E5
    { freq: 987.77 * pitchVar, time: now + 0.045 }, // B5
  ];

  notes.forEach((note) => {
    // Fundamental sine wave
    const oscSine = ctx.createOscillator();
    const sineGain = ctx.createGain();

    oscSine.type = 'sine';
    oscSine.frequency.setValueAtTime(note.freq, note.time);

    sineGain.gain.setValueAtTime(0.0001, note.time);
    sineGain.gain.linearRampToValueAtTime(0.18 * duck, note.time + 0.006);
    sineGain.gain.exponentialRampToValueAtTime(0.0001, note.time + 0.22);

    oscSine.connect(sineGain);
    routeToMaster(ctx, sineGain, -0.15, true);

    oscSine.start(note.time);
    oscSine.stop(note.time + 0.24);

    // Warm triangle octave overtone (1 octave higher, quiet)
    const oscTri = ctx.createOscillator();
    const triGain = ctx.createGain();

    oscTri.type = 'triangle';
    oscTri.frequency.setValueAtTime(note.freq * 2, note.time);

    triGain.gain.setValueAtTime(0.0001, note.time);
    triGain.gain.linearRampToValueAtTime(0.035 * duck, note.time + 0.006);
    triGain.gain.exponentialRampToValueAtTime(0.0001, note.time + 0.16);

    oscTri.connect(triGain);
    routeToMaster(ctx, triGain, -0.15, true);

    oscTri.start(note.time);
    oscTri.stop(note.time + 0.18);
  });
}

/**
 * Barely audible typing / clock tick. Off by default.
 */
export function playTickSound() {
  if (!isTickEnabled) return;
  if (currentSpeed > 2) return; // Silent if playback > 2x

  const duck = checkRateLimitAndDucking();
  if (duck === 0) return;

  const ctx = ensureAudioGraph();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.015 * duck, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

  osc.connect(gain);
  routeToMaster(ctx, gain, 0, false);

  osc.start(now);
  osc.stop(now + 0.02);
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
