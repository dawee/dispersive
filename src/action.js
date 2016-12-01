const hat = require('hat');
const Dispatcher = require('./dispatcher');
const Tree = require('./tree');

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
    const wrapper = (...args) => this.callHandler(...args);

    wrapper.action = this;
    wrapper.subscribe = listener => this.dispatcher.subscribe(this, listener);
    wrapper.unsubscribe = listener => this.dispatcher.unsubscribe(this, listener);

    return wrapper;
  }

  trigger(data) {
    this.dispatcher.trigger(this, {data});
  }

  callHandler(...args) {
    let res = null;
    let handlerException = null;

    if (!!this.before) this.before.trigger({args});

    try {
      res = this.handler === null ? null : this.handler.call(this, ...args);
    } catch (exception) {
      handlerException = exception;
    }

    const promise = (res instanceof Promise) ? res : new Promise((resolve, reject) => {
      if (!!handlerException) return reject(handlerException);

      resolve(res);
    });

    promise.catch(error => {
      if (process.env.NODE_ENV !== 'production') console.error(error);

      this.error.trigger(error);
    }).then(data => this.trigger(data));

    return promise;
  }

}

class ActionTree extends Tree {

  _register(name, handler) {
    if (!!handler && !!handler.action && handler.action instanceof Action) {
      this[name] = handler;
    } else {
      this[name] = Action.create(handler);
    }

    this._leafs.add(name);

    return this[name];
  }

}

module.exports = {Action, ActionTree};
