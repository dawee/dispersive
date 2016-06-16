const EventEmitter = require('fbemitter').EventEmitter;
const dispatcher = require('./dispatcher');


let mapping = {};

dispatcher.register((action) => {
  (mapping[action.actionType] || []).forEach((handler) => {
    handler(action);
  });
});


class Store extends EventEmitter {

  on(eventType, handler) {
    return this.addListener(eventType, handler);
  }

  register(action, handler) {
    let actionType = action.actionType;

    if (! (actionType in mapping)) mapping[actionType] = new Set([]);

    mapping[actionType].add(handler.bind(this));
  }

}

module.exports = Store;