const FBEmitter = require('fbemitter').EventEmitter;

class Emittable {

  emitChange(data = {}) {
    this.emit('change', data);
  }

  changed(listener, ctx = null) {
    this.on('change', listener, ctx);
  }

  on(name, listener, ctx = null) {
    this.emitter.addListener(name, (data) => listener.call(ctx, data));
  }

  emit(name, data = {}) {
    this.emitter.emit(name, data);
  }

}


class EventEmitter extends Emittable {

  constructor() {
    super();
    this.emitter = this.constructor.createEmitter();
  }

  static createEmitter() {
    return new FBEmitter();
  }

}

EventEmitter.Emittable = Emittable;

module.exports = EventEmitter;
