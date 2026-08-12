/** Minimal Node-`events`-compatible emitter (browser build, same API surface used here). */
type Listener = (payload: any) => void;

export class EventEmitter {
  private _listeners = new Map<string, Listener[]>();

  addListener(type: string, fn: Listener) {
    const arr = this._listeners.get(type) ?? [];
    arr.push(fn);
    this._listeners.set(type, arr);
    return this;
  }

  on(type: string, fn: Listener) {
    return this.addListener(type, fn);
  }

  removeListener(type: string, fn: Listener) {
    const arr = this._listeners.get(type);
    if (!arr) return this;
    const i = arr.indexOf(fn);
    if (i > -1) arr.splice(i, 1);
    return this;
  }

  removeAllListeners() {
    this._listeners.clear();
    return this;
  }

  emit(type: string, payload?: any) {
    const arr = this._listeners.get(type);
    if (!arr || arr.length === 0) return false;
    arr.slice().forEach((fn) => fn(payload));
    return true;
  }
}
