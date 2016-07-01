const EventEmitter = require('fbemitter').EventEmitter;


class Emitter extends EventEmitter {

  on(name, listener) {
    return this.addListener(name, listener);
  }

  trigger(name, data) {
    this.emit(name, data);
  }

}

module.exports = Emitter;