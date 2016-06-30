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

  on(eventType, handler) {
    return this.addListener(eventType, handler);
  }

  bindAction(action, handler) {
    let actionType = action.actionType;

    if (! (actionType in eventMapping)) eventMapping[actionType] = new Set([]);

    eventMapping[actionType].add(handler.bind(this));
  }

  _getCid() {
    return this.cid || 'id';
  }

  get(id) {
    this._entries = this._entries || {};

    return this._entries[id];
  }

  add(entry) {
    this._entries = this._entries || {};
    this._entries[entry[this._getCid()]] = entry;    
  }

  remove(entry) {
    delete this._entries[entry[this._getCid()]];
  }

  *all() {
    this._entries = this._entries || {};

    for (const id of Object.keys(this._entries)) {
      yield this.get(id);
    }
  }

  listAll() {
    return [...this.all()];
  }
}

module.exports = Store;