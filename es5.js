require("babel-core/register");
require("babel-polyfill");

var Action = require('./es5/lib/action');
var Dispatcher = require('./es5/lib/dispatcher');
var Store = require('./es5/lib/store');

exports.createStoreModel = Store.createModel;
exports.createAction = Action.create;
exports.createDispatcher = function () {
  return new Dispatcher();
};
