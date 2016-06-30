const EventEmitter = require('fbemitter').EventEmitter;
const dispatcher = require('./dispatcher');
const hat = require('hat');
const ObjectsManager = require('./lib/manager');


let eventMapping = {};

dispatcher.register((action) => {
  (eventMapping[action.actionType] || []).forEach((handler) => {
    handler(action);
  });
});


class Store extends EventEmitter {

  constructor() {
    super();

    this.on = this.addListener.bind(this);
    this.trigger = this.emit.bind(this);
    this.objects = new ObjectsManager();
  }

  bindAction(actionWrapper, handler) {
    let actionType = actionWrapper.action.actionType;

    if (! (actionType in eventMapping)) {
      eventMapping[actionType] = new Set([]);
    }

    eventMapping[actionType].add(handler.bind(this));
  }

}

module.exports = Store;