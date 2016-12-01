const FluxDispatcher = require('flux').Dispatcher;


class Dispatcher extends FluxDispatcher {

  constructor() {
    super();

    this.mapping = {};
    this.register(event => this.wakeUp(event));
  }

  subscribe(action, listener) {
    if (! (action.actionType in this.mapping)) this.mapping[action.actionType] = new Set();

    this.mapping[action.actionType].add(listener);
  }

  unsubscribe(action, listener) {
    if (! (action.actionType in this.mapping)) return;

    this.mapping[action.actionType].delete(listener);
  }

  wakeUp(event) {
    const handlers = this.mapping[event.actionType] || [];

    handlers.forEach((handler) => handler(event.data));
  }

  trigger(action, event) {
    event.actionType = action.actionType;

    this.dispatch(event);
  }

}

Dispatcher.main = new Dispatcher();

module.exports = Dispatcher;

