const hat = require('hat');
const Dispatcher = require('./dispatcher');

const noop = (argv) => argv;


class ActionGroup {

  constructor() {
    this.steps = [];
  }

  chain(actionWrapper, argv) {
    this.steps.push({action: actionWrapper.action, argv})
    return this;
  }

  executeAll(done) {
    if (! (this.steps.length > 0)) return done();

    let index = 0;
    const steps = this.steps;

    const runNext = () => {
      if (index >= steps.length) return done();

      const action = steps[index].action;
      const argv = steps[index].argv || [];

      action.callHandler(() => {
        index++;
        setTimeout(runNext, 0);
      }, argv);

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
      this.error = Action.create(noop, this.dispatcher, true);
      this.boundWrapper.error = this.error;
    }
  }

  trigger(callback, data) {
    this.dispatcher.trigger(this, data);
    callback();
  }

  deferError(argv) {
    setTimeout(() => this.error.apply(null, argv), 0);
  }

  callHandler(callback, argv) {
    const result = (this.handler || noop).apply(null, argv);
    const wrappedTrigger = (data) => this.trigger(callback, data);

    if (result instanceof Promise) {
      result.then(wrappedTrigger).catch((...errArgv) => this.deferError(errArgv));
    } else if (result instanceof ActionGroup) {
      result.executeAll(wrappedTrigger);
    } else {
      wrappedTrigger(result);
    }
  }

  wrapper(...argv) {
    this.callHandler(noop, argv);
  }

}

module.exports = Action;
