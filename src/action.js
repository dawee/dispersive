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

  createPromiseFromHandler(...args) {
    return new Promise((resolve, reject) => {
      let result = null;

      try {
        result = this.handler === null ? null : this.handler.call(this, ...args);
      } catch (exception) {
        return reject(exception);
      }

      if (! (result instanceof Promise)) return resolve(result);

      result.catch(error => reject(error)).then(result => resolve(result));
    });
  }

  callHandler(...args) {
    if (!!this.before) this.before.trigger({args});

    return new Promise((resolve, reject) => {
      this.createPromiseFromHandler(...args)
        .catch(error => {
          this.error.trigger(error);
          reject(error);
        })
        .then(result => {
          this.trigger(result);
          resolve(result);
        });
    });
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
