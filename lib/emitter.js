const FBEmitter = require('fbemitter').EventEmitter;


class EventEmitter {

  constructor() {
    this.fbemitter = new FBEmitter();
  }

  on(name, listener, ctx = null) {
    this.fbemitter.addListener(name, (data) => listener.call(ctx, data));
  }

  emit(name, data = {}) {
    this.fbemitter.emit(name, data);
  }

  change(data = {}) {
    this.emit('change', data);
  }

  changed(listener, ctx = null) {
    this.on('change', listener, ctx);
  }

}


module.exports = EventEmitter;
