// @ts-check

import { isTimeSkip } from './timeline.js';

/**
 * @typedef {'IDLE' | 'LOADED' | 'PLAYING' | 'PAUSED' | 'SEEKING' | 'ENDED'} PlayerState
 */

/**
 * @typedef {Object} TimeUpdatePayload
 * @property {number} virtualTime
 * @property {number} progress 0.0 to 1.0
 * @property {number} currentIndex
 * @property {import('./parser/index.js').ChatMessage | null} currentMessage
 */

/**
 * Playback controller driven by requestAnimationFrame virtual clock.
 * Zero setTimeout chains: speed changes, pause, and seeking are 100% drift-free.
 */
/**
 * Maps speed rating (-4 to +4) to actual playback rate multiplier.
 * Negative speeds (-1x to -4x) slow down typing/playback:
 * -4 -> 0.25 (4x slower)
 * -3 -> 0.333 (3x slower)
 * -2 -> 0.5 (2x slower, takes twice as long)
 * -1 -> 0.75 (1.33x slower)
 * +1 -> 1.0 (normal)
 * +2 -> 2.0 (2x faster)
 * +3 -> 3.0 (3x faster)
 * +4 -> 4.0 (4x faster)
 *
 * @param {number} speedRating
 * @returns {number}
 */
export function getSpeedFactor(speedRating) {
  if (speedRating <= -4) return 0.25;
  if (speedRating === -3) return 1 / 3;
  if (speedRating === -2) return 0.5;
  if (speedRating === -1) return 0.75;
  if (speedRating === 0 || speedRating === 1) return 1.0;
  if (speedRating === 2) return 2.0;
  if (speedRating === 3) return 3.0;
  return 4.0;
}

export class ChatPlayer {
  /**
   * @param {import('./timeline.js').Timeline} timeline
   */
  constructor(timeline) {
    this.timeline = timeline;
    /** @type {PlayerState} */
    this.state = 'LOADED';
    this.virtualTime = 0;
    this.speedRating = 1;
    this.speed = 1.0;
    this.currentIndex = -1;
    this.lastFrameTime = 0;
    /** @type {number | null} */
    this.animationFrameId = null;

    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();

    // Auto-pause on tab switch to prevent time drift or message floods
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.state === 'PLAYING') {
          this.pause();
        }
      });
    }
  }

  /**
   * Subscribe to player events: 'timeupdate', 'message', 'timeskip', 'statechange', 'speedchange', 'end'
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  /**
   * @param {string} event
   * @param {any} [data]
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(data);
      }
    }
  }

  /**
   * Starts or resumes playback.
   */
  play() {
    if (this.state === 'PLAYING') return;

    if (this.state === 'ENDED') {
      // Loop or restart from beginning
      this.seekTo(0);
    }

    this._setState('PLAYING');
    this.lastFrameTime = performance.now();
    this._tick = this._tick.bind(this);
    this.animationFrameId = requestAnimationFrame(this._tick);
  }

  /**
   * Pauses playback.
   */
  pause() {
    if (this.state !== 'PLAYING') return;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this._setState('PAUSED');
  }

  /**
   * Toggles between play and pause.
   */
  togglePlay() {
    if (this.state === 'PLAYING') {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Seeks to an exact cumulative virtual time in milliseconds.
   * @param {number} timeMs
   */
  seekTo(timeMs) {
    const clampedTime = Math.max(0, Math.min(this.timeline.totalDuration, timeMs));
    this.virtualTime = clampedTime;

    const newIndex = this.timeline.findIndexAtTime(clampedTime);
    const oldIndex = this.currentIndex;
    this.currentIndex = newIndex;

    this.emit('timeupdate', this._getCurrentPayload());

    if (newIndex !== oldIndex || timeMs === 0) {
      const msg = this.timeline.messages[newIndex];
      if (msg) {
        this.emit('message', {
          message: msg,
          index: newIndex,
          isSeek: true,
        });
      }
    }

    if (this.virtualTime >= this.timeline.totalDuration && this.state !== 'ENDED') {
      this._setState('ENDED');
      this.emit('end');
    }
  }

  /**
   * Seeks to a specific message index.
   * @param {number} index
   */
  seekToMessage(index) {
    const total = this.timeline.messages.length;
    const clampedIndex = Math.max(0, Math.min(total - 1, index));
    const targetTime = this.timeline.getTimeAtIndex(clampedIndex);
    this.seekTo(targetTime);
  }

  /**
   * Seeks to normalized progress (0.0 to 1.0).
   * @param {number} progress
   */
  seekByProgress(progress) {
    const { timeMs } = this.timeline.seekByProgress(progress);
    this.seekTo(timeMs);
  }

  /**
   * Advances immediately to the next message.
   */
  nextMessage() {
    if (this.currentIndex < this.timeline.messages.length - 1) {
      this.seekToMessage(this.currentIndex + 1);
    }
  }

  /**
   * Jumps immediately to the previous message.
   */
  prevMessage() {
    if (this.currentIndex > 0) {
      this.seekToMessage(this.currentIndex - 1);
    }
  }

  /**
   * Updates playback speed by rating (-4 to +4) or factor.
   * Negative ratings (-1x to -4x) slow down typing/playback.
   * @param {number} speed
   */
  setSpeed(speed) {
    if (speed === 0) return;
    if (speed < 0 || (speed >= 1 && speed <= 4 && Number.isInteger(speed))) {
      this.speedRating = speed;
      this.speed = getSpeedFactor(speed);
    } else {
      this.speed = Math.max(0.1, speed);
      this.speedRating = this.speed >= 1 ? Math.round(this.speed) : -Math.round(1 / this.speed);
    }
    this.emit('speedchange', { speed: this.speed, rating: this.speedRating });
  }

  /**
   * Updates gap compression policy ('smart' | 'realtime' | 'fixed').
   * @param {import('./timeline.js').GapMode} mode
   */
  setGapMode(mode) {
    // Preserve current message position while recomputing timeline
    const curMsgIndex = this.currentIndex;
    this.timeline.recomputeGapPolicy({ mode });
    this.seekToMessage(curMsgIndex);
  }

  _tick() {
    if (this.state !== 'PLAYING') return;

    const now = performance.now();
    // Clamp frame dt between 0 and 100ms to prevent huge jumps when frames drop
    const dt = Math.min(100, Math.max(0, now - this.lastFrameTime));
    this.lastFrameTime = now;

    this.virtualTime += dt * this.speed;

    const newIndex = this.timeline.findIndexAtTime(this.virtualTime);

    // If new messages have been reached
    if (newIndex > this.currentIndex) {
      for (let i = this.currentIndex + 1; i <= newIndex; i++) {
        const msg = this.timeline.messages[i];
        const prevMsg = this.timeline.messages[i - 1];

        // Check for time-skip chip (gaps >= 3 hours)
        if (msg && prevMsg && isTimeSkip(msg.timestamp - prevMsg.timestamp)) {
          this.emit('timeskip', {
            gapMs: msg.timestamp - prevMsg.timestamp,
            fromDate: prevMsg.timestamp,
            toDate: msg.timestamp,
          });
        }

        if (msg) {
          this.emit('message', {
            message: msg,
            index: i,
            isSeek: false,
          });
        }
      }
      this.currentIndex = newIndex;
    }

    this.emit('timeupdate', this._getCurrentPayload());

    if (this.virtualTime >= this.timeline.totalDuration) {
      this.virtualTime = this.timeline.totalDuration;
      this.pause();
      this._setState('ENDED');
      this.emit('end');
      return;
    }

    this.animationFrameId = requestAnimationFrame(this._tick);
  }

  /**
   * @private
   * @param {PlayerState} newState
   */
  _setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.emit('statechange', { state: this.state });
    }
  }

  /**
   * @private
   * @returns {TimeUpdatePayload}
   */
  _getCurrentPayload() {
    return {
      virtualTime: this.virtualTime,
      progress: this.timeline.getProgress(this.virtualTime),
      currentIndex: this.currentIndex,
      currentMessage: this.timeline.messages[this.currentIndex] || null,
    };
  }

  destroy() {
    this.pause();
    this.listeners.clear();
  }
}
