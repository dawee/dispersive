const Action = require('./lib/action');
const Dispatcher = require('./lib/dispatcher');
const Store = require('./lib/store');


exports.createStore = (dispatcher) => new Store(dispatcher);
exports.createAction = Action.create;
exports.createActionGroup = Action.createGroup;
exports.createDispatcher = () => new Dispatcher();