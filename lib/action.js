const hat = require('hat');
const Dispatcher = require('./dispatcher');

const noop = (argv) => argv;


class ActionGroup {

  constructor() {
    this.steps = [];
  }

  chain(actionWrapper, argv) {
    this.steps.push({action: actionWrapper.action, argv});
    return this;
  }

  executeAll(resolve, reject) {
    if (! (this.steps.length > 0)) return resolve();

    let index = 0;
    const steps = this.steps;

    const runNext = () => {
      if (index >= steps.length) return resolve();

      const action = steps[index].action;
      const argv = steps[index].argv || [];

      action.callHandler(argv, () => {
        index++;
        setTimeout(runNext, 0);
      }, reject);
    };

    runNext();
  }
}

class Action {

  static create(handler, dispatcher, standalone) {
    const action = new Action(handler, dispatcher, standalone);

    return action.boundWrapper;
  }

  static createGroup() {
    return new ActionGroup();
  }

  constructor(handler, dispatcher, standalone) {
    this.dispatcher = dispatcher || Dispatcher.main();
    this.actionType = hat();
    this.handler = handler;
    this.boundWrapper = this.wrapper.bind(this);
    this.boundWrapper.action = this;

    if (!standalone) {
      this.error = new Action(noop, this.dispatcher, true);
      this.boundWrapper.error = this.error.boundWrapper;
    }
  }

  trigger(data, callback) {
    this.dispatcher.trigger(this, data);
    callback();
  }

  deferError(argv) {
    setTimeout(() => this.error.apply(null, argv), 0);
  }

  callHandler(argv, resolve, reject) {
    const result = (this.handler || noop).apply(null, argv);
    const wrappedTrigger = (data) => this.trigger(data, resolve);
    const wrappedError = (data) => this.error.trigger(data, reject);

    if (result instanceof Promise) {
      result.then(wrappedTrigger).catch(wrappedError);
    } else if (result instanceof ActionGroup) {
      result.executeAll(wrappedTrigger, wrappedError);
    } else {
      wrappedTrigger(result);
    }
  }

  wrapper(...argv) {
    this.callHandler(argv, noop, noop);
  }

}

module.exports = Action;
