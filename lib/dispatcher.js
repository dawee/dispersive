const FluxDispatcher = require('flux').Dispatcher;


class Dispatcher extends FluxDispatcher {

  static main() {
    this._main = this._main || new Dispatcher();
    return this._main;
  }

  constructor() {
    super();

    this.eventMapping = {};
    this.register(this.forwardAction.bind(this));
  }

  forwardAction(action) {
    if (! (action.actionType in this.eventMapping)) return;

    this.eventMapping[action.actionType].forEach((handler) => handler(action));
  }

  on(actionWrapper, handler) {
    const actionType = actionWrapper.action.actionType;

    if (! (actionType in this.eventMapping)) this.eventMapping[actionType] = new Set([]);

    this.eventMapping[actionType].add(handler);
  }

  trigger(action, data) {
    this.dispatch(Object.assign({actionType: action.actionType}, data));
  }

}

module.exports = Dispatcher;

