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

}

module.exports = EventEmitter;
