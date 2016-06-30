const hat = require('hat');
const dispatcher = require('./dispatcher');

const noop = (done) => done();

exports.create = (handler) => {
  let actionType = hat();

  let wrapper = (...argv) => {

    argv.push((err, result) => {
      let data = result || {};
      data.actionType = actionType;
      dispatcher.dispatch(data);
    });

    (handler || noop).apply(null, argv);
  };

  wrapper.actionType = actionType;
  wrapper.handler = handler;

  return wrapper;
};
