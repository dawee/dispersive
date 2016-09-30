const {omit} = require('./object');
const FluxDispatcher = require('flux').Dispatcher;


class Dispatcher extends FluxDispatcher {

  static get main() {
    this._main = this._main || new Dispatcher();
    return this._main;
  }

  constructor() {
    super();

    this.mapping = {};
    this.register((data) => this.react(data));
  }

  subscribe(action, listener) {
    if (! (action.actionType in this.mapping)) this.mapping[action.actionType] = new Set();

    this.mapping[action.actionType].add(listener);
  }

  unsubscribe(action, listener) {
    if (! (action.actionType in this.mapping)) return;

    this.mapping[action.actionType].delete(listener);
  }

  react(data) {
    if (! (data.actionType in this.mapping)) return;

    this.mapping[data.actionType].forEach(
      (handler) => setTimeout(() => handler(omit(data, 'actionType')), 0)
    );
  }

  trigger(action, data) {
    this.dispatch(Object.assign({actionType: action.actionType}, data));
  }

}


module.exports = Dispatcher;

