// @ts-check

/**
 * Tiny observable store built on Map.
 * Provides lightweight reactive state without third-party frameworks.
 */
export class Store {
  /**
   * @param {Record<string, any>} [initialState]
   */
  constructor(initialState = {}) {
    /** @type {Map<string, any>} */
    this._state = new Map(Object.entries(initialState));
    /** @type {Map<string, Set<(val: any, prev: any) => void>>} */
    this._subscribers = new Map();
    /** @type {Set<(key: string, val: any, prev: any) => void>} */
    this._globalSubscribers = new Set();
  }

  /**
   * Retrieves a value by key.
   * @param {string} key
   * @param {any} [defaultValue]
   * @returns {any}
   */
  get(key, defaultValue = undefined) {
    return this._state.has(key) ? this._state.get(key) : defaultValue;
  }

  /**
   * Sets a value by key and notifies subscribers if changed.
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    const prev = this._state.get(key);
    if (prev === value) return;

    this._state.set(key, value);

    const keySubs = this._subscribers.get(key);
    if (keySubs) {
      for (const cb of keySubs) {
        cb(value, prev);
      }
    }

    for (const globalCb of this._globalSubscribers) {
      globalCb(key, value, prev);
    }
  }

  /**
   * Updates multiple keys at once.
   * @param {Record<string, any>} updates
   */
  update(updates) {
    for (const [k, v] of Object.entries(updates)) {
      this.set(k, v);
    }
  }

  /**
   * Subscribes to changes on a specific key.
   * @param {string} key
   * @param {(val: any, prev: any) => void} callback
   * @returns {() => void} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this._subscribers.has(key)) {
      this._subscribers.set(key, new Set());
    }
    this._subscribers.get(key)?.add(callback);
    return () => this._subscribers.get(key)?.delete(callback);
  }

  /**
   * Subscribes to all state updates.
   * @param {(key: string, val: any, prev: any) => void} callback
   * @returns {() => void}
   */
  subscribeAll(callback) {
    this._globalSubscribers.add(callback);
    return () => this._globalSubscribers.delete(callback);
  }
}
