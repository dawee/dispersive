const {EventEmitter} = require('fbemitter');


class ChangesEmitter {

  constructor() {
    this.emitter = new EventEmitter();
  }

  emitChange(data = {}) {
    this.emit('change', data);
  }

  changed(listener, ctx = null) {
    return this.on('change', listener, ctx);
  }

  on(name, listener, ctx = null) {
    return this.emitter.addListener(name, data => listener.call(ctx, data));
  }

  emit(name, data = {}) {
    this.emitter.emit(name, data);
  }

}

const createChangesEmitter = () => new ChangesEmitter();

module.exports = {
  ChangesEmitter,
  createChangesEmitter,
};
