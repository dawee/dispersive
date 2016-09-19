const FluxDispatcher = require('flux').Dispatcher;


class Dispatcher extends FluxDispatcher {

  static main() {
    this.mainInstance = this.mainInstance || new Dispatcher();
    return this.mainInstance;
  }

  trigger(action, data) {
    this.dispatch(Object.assign({actionType: action.actionType}, data));
  }

}


module.exports = Dispatcher;

