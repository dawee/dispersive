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

  static emitter() {
    this.staticEmitter = this.staticEmitter || new EventEmitter();
  }

  static on(...args) {
    return this.staticEmitter.on(...args);
  }

  static emit(...args) {
    return this.staticEmitter.emit(...args);
  }

  static change(...args) {
    return this.staticEmitter.change(...args);
  }

}


module.exports = EventEmitter;
