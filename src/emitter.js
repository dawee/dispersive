const {EventEmitter} = require('fbemitter');

const CHANGE_EVENT = 'change';

class ChangesEmitter {

  constructor() {
    this.emitter = new EventEmitter();
  }

  emitChange(data = {}) {
    this.emitter.emit(CHANGE_EVENT, data);
  }

  changed(listener) {
    return this.emitter.addListener(CHANGE_EVENT, listener);
  }

}

const createChangesEmitter = () => new ChangesEmitter();

module.exports = {
  ChangesEmitter,
  createChangesEmitter,
};
