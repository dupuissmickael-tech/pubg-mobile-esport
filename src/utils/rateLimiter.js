// File d'attente qui garantit qu'on ne dépasse jamais `maxRequests`
// appels sur une fenêtre glissante de `windowMs` millisecondes.
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.timestamps = [];
    this.queue = [];
    this.processing = false;
  }

  schedule(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this._processQueue();
    });
  }

  _processQueue() {
    if (this.processing) return;
    this.processing = true;
    this._tick();
  }

  _tick() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length < this.maxRequests) {
      const { fn, resolve, reject } = this.queue.shift();
      this.timestamps.push(Date.now());
      Promise.resolve()
        .then(fn)
        .then(resolve, reject)
        .finally(() => this._tick());
    } else {
      const oldest = this.timestamps[0];
      const waitMs = this.windowMs - (now - oldest) + 50;
      setTimeout(() => this._tick(), waitMs);
    }
  }
}

module.exports = RateLimiter;
