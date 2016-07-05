require("babel-core/register");
require("babel-polyfill");

const Action = require('./es5/lib/action');
const Dispatcher = require('./es5/lib/dispatcher');
const Store = require('./es5/lib/store');

exports.createStore = (dispatcher) => new Store(dispatcher);
exports.createAction = Action.create;
exports.createActionGroup = Action.createGroup;
exports.createDispatcher = () => new Dispatcher();

