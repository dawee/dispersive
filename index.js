if (process.env.DISPERSIVE_ECMA === '5') {
  module.exports = require('./es5');
} else {
  const Action = require('./lib/action');

  exports.Model = require('./lib/model');
  exports.ObjectManager = require('./lib/manager');
  exports.createAction = Action.create;
  exports.Dispatcher = require('./lib/dispatcher');
  exports.Schema = require('./lib/schema');
}

