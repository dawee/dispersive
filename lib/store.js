const Emitter = require('./emitter');
const Dispatcher = require('./dispatcher');
const ObjectsManager = require('./manager');

class Store {
  static create() {
    return {
      emitter: new Emitter(),
      dispatcher: Dispatcher.main(),
      objects: new ObjectsManager(),
    }
  }
}

module.exports = Store;