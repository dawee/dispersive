const Action = require('./lib/action');
const Emitter = require('./lib/emitter');
const Dispatcher = require('./lib/dispatcher');
const ObjectsManager = require('./lib/manager');


exports.createStore = () => ({
  emitter: new Emitter(),
  dispatcher: Dispatcher.main(),
  objects: new ObjectsManager(),
});

exports.createAction = Action.create;
exports.createActionGroup = Action.createGroup;
exports.createDispatcher = () => new Dispatcher();