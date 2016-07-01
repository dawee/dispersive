const Emitter = require('./emitter');
const Dispatcher = require('./dispatcher');
const ObjectsManager = require('./manager');


exports.create = () => ({
  emitter: new Emitter(),
  dispatcher: Dispatcher.main(),
  objects: new ObjectsManager(),
});