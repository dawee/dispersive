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


class Store {

  static emitter() {
    this._emitter = this._emitter || new EventEmitter();
    return this._emitter;
  }

  static bindAction(actionWrapper, handler) {
    let actionType = actionWrapper.action.actionType;

    if (! (actionType in eventMapping)) {
      eventMapping[actionType] = new Set([]);
    }

    eventMapping[actionType].add(handler.bind(this));
  }

  static initialize() {
    if (this._initialized) throw "Store.initialize() should be called only once";

    this.objects = new ObjectsManager();
    this.on = this.emitter().addListener.bind(this);
    this.trigger = this.emitter().emit.bind(this);
    this.bindActions();
    this._initialized = true;

    return this;
  }


  static bindActions() {}

}

module.exports = Store;