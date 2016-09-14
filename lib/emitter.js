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
    if (!!listener) {
      this.on('change', listener, ctx);
    } else {
      this.emit('change');
    }
  }

}

module.exports = EventEmitter;
