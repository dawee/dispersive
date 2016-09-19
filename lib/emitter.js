const FBEmitter = require('fbemitter').EventEmitter;


class EventEmitter {

  constructor() {
    this.fbemitter = new FBEmitter();
  }

  on(name, listener, ctx) {
    this.fbemitter.addListener(name, !!ctx ? (data) => listener.call(ctx, data) : listener);
  }

  emit(name, data) {
    this.fbemitter.emit(name, data);
  }

  change(listener, ctx) {
    if (typeof listener === 'function') {
      this.on('change', listener, ctx);
    } else {
      this.emit('change');
    }
  }

}

EventEmitter.static = () => {
  const emitter = new EventEmitter();

  class EventEmittable extends EventEmitter {}

  EventEmittable.on = (name, listener, ctx) => emitter.on(name, listener, ctx);
  EventEmittable.emit = (name, data) => emitter.emit(name, data);
  EventEmittable.change = (listener, ctx) => emitter.change(listener, ctx);

  return EventEmittable;
};

module.exports = EventEmitter;
