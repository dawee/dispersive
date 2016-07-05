let Action;
let Dispatcher;
let Store;

if (process.env.DISPERSIVE_ECMA === '5') {
  Action = require('./lib/action');
  Dispatcher = require('./lib/dispatcher');
  Store = require('./lib/store');
} else {
  require("babel-core/register");
  require("babel-polyfill");
  Action = require('./es5/lib/action');
  Dispatcher = require('./es5/lib/dispatcher');
  Store = require('./es5/lib/store');
}

exports.createStore = (dispatcher) => new Store(dispatcher);
exports.createAction = Action.create;
exports.createActionGroup = Action.createGroup;
exports.createDispatcher = () => new Dispatcher();
