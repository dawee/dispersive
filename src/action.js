const hat = require('hat');
const Dispatcher = require('./dispatcher');

const SUBS = ['before', 'error'];

class Action {

  static create(handler, opts = {}) {
    opts = Object.assign({dispatcher: Dispatcher.main, type: Action}, opts);

    const ActionType = opts.type;
    const action = new ActionType(handler, opts.dispatcher);

    return action.wrapper;
  }

  constructor(handler = null, dispatcher = Dispatcher.main, isSubAction = false) {
    this.dispatcher = dispatcher;
    this.actionType = hat();
    this.handler = handler;
    this.wrapper = this.buildWrapper();

    if (!isSubAction) SUBS.forEach(name => this.attachSubAction(name));
  }

  attachSubAction(name) {
    const action = new Action(null, this.dispatcher, true);

    this[name] = action;
    this.wrapper[name] = action.wrapper;
  }

  buildWrapper() {
    const wrapper = (...argv) => this.callHandler(...argv);

    wrapper.action = this;
    wrapper.subscribe = listener => this.dispatcher.subscribe(this, listener);
    wrapper.unsubscribe = listener => this.dispatcher.unsubscribe(this, listener);

    return wrapper;
  }

  trigger(data) {
    this.dispatcher.trigger(this, data);
  }

  callHandler(...argv) {
    if (!!this.before) this.before.trigger();

    const res = this.handler === null ? null : this.handler.call(this, ...argv);
    const promise = (res instanceof Promise) ? res : new Promise(resolve => resolve(res));

    promise
      .then(data => this.trigger(data))
      .catch(error => this.error.trigger(error));

    return promise;
  }

}

module.exports = Action;
