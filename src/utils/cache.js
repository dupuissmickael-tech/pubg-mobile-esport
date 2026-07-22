class SimpleCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data, ttlMs) {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }
}

module.exports = SimpleCache;
