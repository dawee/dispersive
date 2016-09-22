if (process.env.DISPERSIVE_ECMA === '5') {
  module.exports = require('./es5');
} else {
  const Action = require('./lib/action');
  const Dispatcher = require('./lib/dispatcher');
  const Store = require('./lib/store');

  exports.createStoreModel = Store.createModel;
  exports.createAction = Action.create;
  exports.createDispatcher = () => new Dispatcher();
}

