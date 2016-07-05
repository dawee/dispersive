const FluxDispatcher = require('flux').Dispatcher;
const omit = require('101/omit');


class Dispatcher extends FluxDispatcher {

  static main() {
    this.mainInstance = this.mainInstance || new Dispatcher();
    return this.mainInstance;
  }

  constructor() {
    super();

    this.eventMapping = {};
    this.register(this.forwardData.bind(this));
  }

  unbindAll() {
    this.eventMapping = {};
  }

  forwardData(data) {
    if (! (data.actionType in this.eventMapping)) return;

    this.eventMapping[data.actionType].forEach(
      (handler) => handler(omit(data, 'actionType'))
    );
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

