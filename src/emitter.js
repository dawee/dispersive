const FBEmitter = require('fbemitter').EventEmitter;

const funnels = [];
let funnel = null;

class Emittable {

  emitChange(data = {}) {
    this.emit('change', data);
  }

  changed(listener, ctx = null) {
    return this.on('change', listener, ctx);
  }

  on(name, listener, ctx = null) {
    return this.emitter.addListener(name, (data) => listener.call(ctx, data));
  }

  emit(name, data = {}) {
    if (!!funnel) return funnel.add({emitter: this.emitter, name, data});

    this.emitter.emit(name, data);
  }

}


class EventEmitter extends Emittable {

  constructor() {
    super();
    this.emitter = new FBEmitter();
  }

  static createEmitter() {
    return new FBEmitter();
  }

}

class Funnel {

  constructor() {
    this.stack = [];
  }

  same(emitted, stacked) {
    return emitted.emitter === stacked.emitter
      && emitted.name === stacked.name
      && stacked.data.__sources__.has(emitted.data.__source__);
  }

  addSource(emitted, stacked) {
    if (emitted.emitter !== stacked.emitter) return false;
    if (emitted.name !== stacked.name) return false;

    if ('__source__' in emitted.data) stacked.data.__sources__.add(emitted.data.__source__);

    return true;
  }

  merge(emitted, stacked) {
    return this.same(emitted, stacked) || this.addSource(emitted, stacked);
  }

  mergeToStack(emitted) {
    let merged = false;

    for (const stacked of this.stack) {
      if (this.merge(emitted, stacked)) {
        merged = true;
        break;
      }
    }

    return merged;
  }

  add(event) {
    if (this.mergeToStack(event)) return;

    event.data.__sources__ = new Set();

    if ('__source__' in event.data) {
      event.data.__sources__.add(event.data.__source__);
      delete event.data.__source__;
    }

    this.stack.push(event);
  }

  emit() {
    for (const event of this.stack) {
      event.data.__sources__ = Array.from(event.data.__sources__);
      event.emitter.emit(event.name, event.data);
    }

    this.stack = [];
  }

  static using(handler) {
    funnel = new Funnel();
    funnels.push(funnel);
    handler(funnel);
    funnel.emit();
    funnels.pop();
    funnel = funnels.length === 0 ? null : funnels[funnels.length - 1];
  }
}

EventEmitter.Emittable = Emittable;
EventEmitter.Funnel = Funnel;

module.exports = EventEmitter;
