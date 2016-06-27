const EventEmitter = require('fbemitter').EventEmitter;
const dispatcher = require('./dispatcher');
const hat = require('hat');


let eventMapping = {};

dispatcher.register((action) => {
  (eventMapping[action.actionType] || []).forEach((handler) => {
    handler(action);
  });
});


class Store extends EventEmitter {

  static prepareMapping() {
    this.mapping = this.mapping || {};
    this.currentId = this.currentId || {};
  }

  static get(id) {
    this.prepareMapping();

    const storeId = id === 'current' ? this.currentId : id;

    return this.mapping[storeId];
  }

  static create() {
    this.prepareMapping();

    const store = new this();

    store.id = hat();
    this.mapping[store.id] = store;
    this.currentId = store.id;

    return store;
  }

  static map(func) {
    this.prepareMapping();

    for (const storeId of Object.keys(this.mapping)) {
      func(this.mapping[storeId]);
    }
  }

  on(eventType, handler) {
    return this.addListener(eventType, handler);
  }

  register(action, handler) {
    let actionType = action.actionType;

    if (! (actionType in eventMapping)) eventMapping[actionType] = new Set([]);

    eventMapping[actionType].add(handler.bind(this));
  }

}

module.exports = Store;